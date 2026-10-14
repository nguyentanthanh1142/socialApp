package com.ntt.feed_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ntt.common_lib.cache.PostCache;
import com.ntt.common_lib.dto.CachedPostDTO;
import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.dto.PageResponse;
import com.ntt.common_lib.dto.UserProfileDTO;
import com.ntt.common_lib.event.PostCreatedEvent;
import com.ntt.feed_service.cache.PostCacheService;
import com.ntt.feed_service.cache.UserProfileCacheImpl;
import com.ntt.feed_service.dto.response.FeedPageResponse;
import com.ntt.feed_service.dto.response.FeedResponse;
import com.ntt.feed_service.redis.RedisScripts;
import com.ntt.feed_service.repository.httpClient.RelationClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedService {

    RedisTemplate<String, String> redisTemplate;
    RedisTemplate<String, Object> redisObjectTemplate;

    RelationClient relationClient;
    UserProfileCacheImpl userProfileCache;
    PostCacheService postCacheService;
    RedisScripts redisScripts;
    ObjectMapper objectMapper;


    private static final String FEED_KEY_PREFIX = "feed:zset:";
    private static final String POST_CACHED_KEY_PREFIX = "cached_post:";
    private static final String POST_KEY_PREFIX = "post:";
    private static final String MARK_READ_PREFIX = "feed:read:";
    private static final String LIKE_KEY = "post:likes:";
    private static final String CHECKPOINT_KEY_PREFIX = "feed:checkpoint:";


    public FeedPageResponse<FeedResponse> getMyFeeds(Double checkpoint, int size) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String feedKey = FEED_KEY_PREFIX + userId;
        String feedReadKey = MARK_READ_PREFIX + userId;
        String checkpointKey = CHECKPOINT_KEY_PREFIX + userId;

        double queryCheckpoint = (checkpoint != null) ? checkpoint : Double.MAX_VALUE;

        Set<ZSetOperations.TypedTuple<String>> postTuples = redisTemplate.opsForZSet()
                .reverseRangeByScoreWithScores(feedKey, Double.NEGATIVE_INFINITY, queryCheckpoint, 0, size);

        if (postTuples == null || postTuples.isEmpty()) {
            return FeedPageResponse.<FeedResponse>builder()
                    .totalElements(0)
                    .totalPages(0)
                    .pageSize(size)
                    .data(List.of())
                    .hasNext(false)
                    .build();
        }
        List<String> postIds = postTuples.stream().map(ZSetOperations.TypedTuple::getValue).toList();

        List<CachedPostDTO> cachedPostDTOS = postIds.stream()
                .map(postCacheService::getPost)
                .filter(Objects::nonNull)
                .filter(post -> {
                    if (post.getPrivacy() != null && post.getPrivacy().name().equals("PRIVATE")) {
                        return post.getOwnerId().equals(userId);
                    }
                    return true;
                })
                .toList();

        List<FeedResponse> feeds = cachedPostDTOS.stream()
                .map(post -> FeedResponse.builder()
                        .postId(post.getId())
                        .userId(post.getOwnerId())
                        .content(post.getContent())
                        .likeCount(getLikeCountFromRedis(post.getId()))
                        .createdAt(post.getCreatedAt())
                        .liked(isUserLiked(post.getId(), userId))
                        .files(post.getFiles())
                        .score(postTuples.stream()
                                .filter(t -> t.getValue().equals(post.getId()))
                                .findFirst()
                                .map(ZSetOperations.TypedTuple::getScore)
                                .orElse(0.0))
                        .name(post.getAuthor().getUsername())
                        .avatarUrl(post.getAuthor().getAvatarUrl())
                        .isRead(isPostRead(post.getId(), userId))
                        .build())
                .toList();

        Double minScore = postTuples.stream()
                .map(ZSetOperations.TypedTuple::getScore)
                .filter(Objects::nonNull)
                .min(Double::compareTo)
                .orElse(null);

        double nextCheckpoint = (minScore != null) ? minScore - 1 : queryCheckpoint;

        boolean hasNext = feeds.size() == size;

        long totalElements = Optional.ofNullable(redisTemplate.opsForZSet().zCard(feedKey)).orElse(0L);

        return FeedPageResponse.<FeedResponse>builder()
                .data(feeds)
                .totalElements(totalElements)
                .pageSize(size)
                .nextCheckpoint(nextCheckpoint)
                .hasNext(hasNext)
                .build();
    }

    public List<String> getMyFollowers() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return getFollowersSafe(userId);
    }

    public void markRead(List<String> postIds) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String key = MARK_READ_PREFIX + userId;

        redisTemplate.opsForSet().add(key, postIds.toArray(new String[0]));
        redisTemplate.expire(key, Duration.ofDays(7));
        log.info("postId" + postIds.toString());
    }

    public void updateCheckpoint(String lastPostId) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String feedKey = FEED_KEY_PREFIX + userId;
        String checkPointKey = CHECKPOINT_KEY_PREFIX + userId;

        Double score = redisTemplate.opsForZSet().score(feedKey, lastPostId);
        if (score != null) {
            redisTemplate.opsForValue().set(checkPointKey, String.valueOf(score));
            log.info("Updated checkpoint for user {} -> {}", userId, score);
        } else {
            log.warn("Cannot update checkpoint: post {} not fou nd in feed {}", lastPostId, feedKey);
        }
    }

    private List<String> getFollowersSafe(String userId) {
        try {
            return relationClient.getFollowers(userId).getResult();
        } catch (Exception e) {
            log.error("Failed to get followers for userId={}", userId, e);
            return List.of();
        }
    }

    private Long getLikeCountFromRedis(String postId) {
        Long count = redisTemplate.opsForSet().size(LIKE_KEY + postId);
        return count != null ? count : 0L;
    }

    private boolean isUserLiked(String postId, String userId) {
        Boolean liked = redisTemplate.opsForSet().isMember(LIKE_KEY + postId, userId);
        return Boolean.TRUE.equals(liked);
    }
    private boolean isPostRead(String postId, String userId) {
        String readKey = MARK_READ_PREFIX + userId;
        Boolean isMember = redisTemplate.opsForSet().isMember(readKey, postId);
        return Boolean.TRUE.equals(isMember);
    }
}
