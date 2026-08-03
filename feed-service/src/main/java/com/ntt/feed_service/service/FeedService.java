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
    private static final String CHECKPOINT_KEY_PREFIX  = "feed:checkpoint:";





    public PageResponse<FeedResponse> getMyFeeds(Double checkpoint, int size) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String feedKey = FEED_KEY_PREFIX + userId;
        String feedReadKey = MARK_READ_PREFIX + userId;
        String checkpointKey = CHECKPOINT_KEY_PREFIX + userId;

        checkpoint = checkpoint != null ? checkpoint : Double.MAX_VALUE;


//        if (checkpoint == null) {
//            String checkpointStr = redisTemplate.opsForValue().get(checkpointKey);
//            checkpoint = (checkpointStr != null) ? Double.parseDouble(checkpointStr) : Double.MAX_VALUE;
//        }

        Set<ZSetOperations.TypedTuple<String>> postTuples = redisTemplate.opsForZSet()
                .reverseRangeByScoreWithScores(feedKey, Double.NEGATIVE_INFINITY, checkpoint, 0, size);

        if(postTuples == null || postTuples.isEmpty())
        {
            return PageResponse.<FeedResponse>builder()
                    .totalElements(0)
                    .totalPages(0)
                    .pageSize(size)
                    .data(List.of())
                    .build();
        }

        List<String> postIds = postTuples.stream().map(ZSetOperations.TypedTuple::getValue).toList();

        List<CachedPostDTO> cachedPostDTOS = postIds.stream()
                .map(postCacheService::getPost)
                .filter(Objects::nonNull).toList();

        List<FeedResponse> feeds = cachedPostDTOS.stream()
                .map( post -> FeedResponse.builder()
                    .postId(post.getId())
                    .userId(post.getOwnerId())
                    .content(post.getContent())
                    .likeCount(getLikeCountFromRedis(post.getId()))
                    .createdAt(post.getCreatedAt())
                    .liked(isUserLiked(post.getId(),userId))
                    .files(post.getFiles())
                    .score(postTuples.stream()
                            .filter(t -> t.getValue().equals(post.getId()))
                            .findFirst()
                            .map(ZSetOperations.TypedTuple::getScore)
                            .orElse(0.0))
                    .name(post.getAuthor().getUsername())
                    .avatarUrl(post.getAuthor().getAvatarUrl())
                    .isRead(true)
                        .build() )
                .toList();


//        List<FeedResponse> feeds = postTuples.stream().map(tuple -> {
//
//            String postId = tuple.getValue();
//            Double score = tuple.getScore();
//
//            Map<Object,Object> postMap = redisTemplate.opsForHash().entries(POST_CACHED_KEY_PREFIX + postId);
//
//            UserProfileDTO profile = userProfileCache.getUserProfile((String)postMap.get("userId"));

//            List<FileResponse> files = Collections.emptyList();
//            String fileJson = (String) postMap.get("files");
//            if(fileJson != null && !fileJson.isEmpty()) {
//                try{
//                    files = objectMapper.readValue(
//                            fileJson, new TypeReference<List<FileResponse>>(){}
//                    );
//                } catch(JsonProcessingException e)
//                {
//                    log.error("Error deserializing files", e);
//                }
//            }

//            return FeedResponse.builder()
//                    .postId(postId)
//                    .userId((String) postMap.get("userId"))
//                    .content((String) postMap.get("content"))
//                    .likeCount(getLikeCountFromRedis(postId))
//                    .createdAt(Instant.parse((String) postMap.get("createdAt")))
//                    .liked(isUserLiked(postId,userId))
//                    .files((String) postMap.get("files"))
//                    .score(score)
//                    .name(profile!=null?profile.getName():null)
//                    .avatarUrl(profile!=null?profile.getAvatarUrl():null)
//                    .isRead(true)
//                    .build();
//        }).toList();

        double newCheckpoint = postTuples.stream()
                .map(ZSetOperations.TypedTuple::getScore)
                .filter(Objects::nonNull)
                .min(Double::compareTo)
                .orElse(checkpoint) - 1;

        redisTemplate.opsForValue().set(checkpointKey, String.valueOf(newCheckpoint));

        long totalElements = Optional.ofNullable(redisTemplate.opsForZSet().zCard(feedKey)).orElse(0L);

        return PageResponse.<FeedResponse>builder()
                .data(feeds)
                .totalElements(totalElements)
                .currentPage(0)
                .totalPages((int) Math.ceil((double) totalElements / size))
                .pageSize(size)
                .build();
    }

//    public PageResponse<FeedResponse> getMyFeed(int page, int size) {
//        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
//        log.info("userId" + userId);
//
//        String feedKey = FEED_KEY_PREFIX + userId;
//        String feedReadKey = MARK_READ_PREFIX + userId;
//        String checkpointKey = CHECKPOINT_KEY_PREFIX + userId;
//
//
//        String checkpointStr  = redisTemplate.opsForValue().get(checkpointKey);
//        Double checkpoint = checkpointStr != null?Double.valueOf(checkpointStr):0.0;
//
//        Set<ZSetOperations.TypedTuple<String>> postTuples = redisTemplate.opsForZSet()
//                .reverseRangeByScoreWithScores(feedKey, checkpoint, Double.MAX_VALUE, 0, size);
//
//        if(postTuples == null || postTuples.isEmpty())
//        {
//            return PageResponse.<FeedResponse>builder()
//            .totalElements(0)
//            .currentPage(page)
//            .totalPages(0)
//            .pageSize(size)
//            .data(List.of())
//            .build();
//        }
//
//        List<FeedResponse> feeds = postTuples.stream().map(tuple -> {
//           String postId = tuple.getValue();
//           Double score = tuple.getScore();
//
//           Map<Object,Object> postMap = redisTemplate.opsForHash().entries(POST_KEY_PREFIX + postId);
//           UserProfileDTO profile = userProfileCache.getUserProfile((String)postMap.get("userId"));
//
//           return FeedResponse.builder()
//                   .postId(postId)
//                   .userId((String) postMap.get("userId"))
//                   .content((String) postMap.get("content"))
//                   .likeCount(getLikeCountFromRedis(postId))
//                   .createdAt(Instant.parse((String) postMap.get("createdAt")))
//                   .liked(isUserLiked(postId,userId))
//                   .name(profile!=null?profile.getName():null)
//                   .avatarUrl(profile!=null?profile.getAvatarUrl():null)
//                   .isRead(true)
//                   .build();
//        }).toList();
//
//
////        int offset = (page-1) * size;
////        int end = offset + size - 1;
////        List<String> blackList = new ArrayList<>();
////
//////        Set<Object> postIds = redisTemplate.opsForZSet().reverseRange(feedKey, offset, end);
////        List<String> postIds = redisScripts.filterFeed(feedKey,feedReadKey,offset,size,blackList);
////        log.info("Post iD : " + postIds.toString());
////
////        // Lấy danh sách postId trong feed từ Redis List
//////        List<Object> postIds = redisTemplate.opsForList().range(feedKey, offset, end);
////        if (postIds.isEmpty()) {
////            return PageResponse.<FeedResponse>builder()
////                    .totalElements(0)
////                    .currentPage(page)
////                    .totalPages(0)
////                    .pageSize(size)
////                    .data(List.of())
////                    .build();
////        }
////
////        List<FeedResponse> feeds = postIds.stream()
////                .map(id -> {
////                    String postKey = POST_KEY_PREFIX + id;
////                    Map<Object,Object> postMap = redisTemplate.opsForHash().entries(postKey);
////                    UserProfileDTO profile = userProfileCache.getUserProfile((String)postMap.get("userId"));
////                    return FeedResponse.builder()
////                            .postId(id)
////                            .userId((String) postMap.get("userId"))
////                            .content((String) postMap.get("content"))
////                            .createdAt(Instant.parse((String) postMap.get("createdAt")))
////                            .liked(isUserLiked(id,userId))
////                            .likeCount(getLikeCountFromRedis(id))
////                            .name(profile!=null?profile.getName():null)
////                            .avatarUrl(profile!=null?profile.getAvatarUrl():null)
////                            .build();
////                } ).toList();
//
//        double newCheckpoint = postTuples.stream()
//                .map(ZSetOperations.TypedTuple::getScore)
//                .min(Double::compareTo)
//                .orElse(checkpoint);
//        redisTemplate.opsForValue().set(checkpointKey, String.valueOf(newCheckpoint));
//
//
//        long totalElements = Optional.ofNullable(redisTemplate.opsForZSet().zCard(feedKey)).orElse(0L);
//        int totalPage = (int) Math.ceil(totalElements/(double) size);
//
//        return PageResponse.<FeedResponse>builder()
//                .data(feeds)
//                .totalElements(totalElements)
//                .currentPage(page)
//                .totalPages(totalPage)
//                .build();
//    }
    public List<String> getMyFollowers() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return getFollowersSafe(userId);
    }

    public void markRead(List<String> postIds) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String key = MARK_READ_PREFIX + userId;

        redisTemplate.opsForSet().add(key, postIds.toArray(new String[0]));
        redisTemplate.expire(key, Duration.ofDays(7));
        log.info("postId"+postIds.toString());
    }

    public void updateCheckpoint(String lastPostId)
    {
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

    private List<String> getFollowersSafe(String userId)
    {
        try{
            return relationClient.getFollowers(userId).getResult();
        } catch (Exception e){
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
}
