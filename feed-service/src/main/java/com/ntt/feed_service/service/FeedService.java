package com.ntt.feed_service.service;

import com.ntt.common_lib.dto.PageResponse;
import com.ntt.common_lib.dto.UserProfileDTO;
import com.ntt.common_lib.event.PostCreatedEvent;
import com.ntt.feed_service.cache.UserProfileCacheImpl;
import com.ntt.feed_service.dto.response.FeedResponse;
import com.ntt.feed_service.redis.RedisScripts;
import com.ntt.feed_service.repository.httpClient.RelationClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedService {

    RedisTemplate<String, String> redisTemplate;
    RelationClient relationClient;
    UserProfileCacheImpl userProfileCache;
    RedisScripts redisScripts;

    private static final String FEED_KEY_PREFIX = "feed:zset:";
    private static final String POST_KEY_PREFIX = "post:";
    private static final String MARK_READ_PREFIX = "feed:read:";

    @KafkaListener(
            topics = "post-created",
            groupId = "feed-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePostCreated(PostCreatedEvent event) {
        log.info("Event" + event.toString());
        String postKey = POST_KEY_PREFIX + event.getPostId();
        redisTemplate.opsForHash().put(postKey, "userId", event.getUserId());
        redisTemplate.opsForHash().put(postKey, "content", event.getContent());
        redisTemplate.opsForHash().put(postKey, "createdAt", String.valueOf(event.getCreatedAt()));

        List<String> followers = getFollowersSafe(event.getUserId());
        log.info("Follower: " + followers.toString());

        for (String followerId : followers) {
            String feedKey = FEED_KEY_PREFIX + followerId;

            //This for Redis List
//            redisTemplate.opsForList().leftPush(feedKey, event.getPostId());
//            redisTemplate.opsForList().trim(feedKey, 0, 999);

            //This for Redis ZSET
            redisTemplate.opsForZSet().add(feedKey, event.getPostId(), event.getCreatedAt().toEpochMilli());
            long size = redisTemplate.opsForZSet().zCard(feedKey);
            if (size > 1000) {
                redisTemplate.opsForZSet().removeRange(feedKey, 0, size - 1001);
            }
        }
    }

    public PageResponse<FeedResponse> getMyFeed(int page, int size) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("userId" + userId);
        String feedKey = FEED_KEY_PREFIX + userId;
        String feedReadKey = MARK_READ_PREFIX + userId;
        int offset = (page-1) * size;
        int end = offset + size - 1;
        List<String> blackList = new ArrayList<>();

//        Set<Object> postIds = redisTemplate.opsForZSet().reverseRange(feedKey, offset, end);
        List<String> postIds = redisScripts.filterFeed(feedKey,feedReadKey,offset,size,blackList);
        log.info("Post iD : " + postIds.toString());

        // Lấy danh sách postId trong feed từ Redis List
//        List<Object> postIds = redisTemplate.opsForList().range(feedKey, offset, end);
        if (postIds.isEmpty()) {
            return PageResponse.<FeedResponse>builder()
                    .totalElements(0)
                    .currentPage(page)
                    .totalPages(0)
                    .pageSize(size)
                    .data(List.of())
                    .build();
        }

//        List<Object> postMaps = redisTemplate.executePipelined((RedisCallback<Object>) (connection) -> {
//            for (Object postId : postIds) {
//                String postKey = POST_KEY_PREFIX + postId;
//                connection.hashCommands().hGetAll(redisTemplate.getStringSerializer().serialize(postKey));
//            }
//            return null;
//        });
//
//        List<FeedResponse> feeds = new ArrayList<>();
//        for (int i = 0; i < postIds.size(); i++) {
//            Object raw = postMaps.get(i);
//            if (!(raw instanceof Map)) continue; // tránh null hoặc object không đúng kiểu
//
//            Map<byte[], byte[]> rawMap = (Map<byte[], byte[]>) raw;
//            if (rawMap == null || rawMap.isEmpty()) continue;
//
//            Map<String, String> postMap = rawMap.entrySet().stream()
//                    .filter(e -> e.getKey() != null && e.getValue() != null)
//                    .collect(Collectors.toMap(
//                            e -> new String((byte[]) e.getKey()),
//                            e -> new String((byte[]) e.getValue())
//                    ));
//
//            feeds.add(FeedResponse.builder()
//                    .postId((String) postIds.get(i))
//                    .userId(postMap.get("userId"))
//                    .content(postMap.get("content"))
//                    .createdAt(Instant.parse(postMap.get("createdAt")))
//                    .build());
//        }
//        Set<String> readPostIds = redisTemplate.opsForSet().members(MARK_READ_PREFIX + userId);

        List<FeedResponse> feeds = postIds.stream()
                .map(id -> {
                    String postKey = POST_KEY_PREFIX + id;
                    Map<Object,Object> postMap = redisTemplate.opsForHash().entries(postKey);
                    UserProfileDTO profile = userProfileCache.getUserProfile((String)postMap.get("userId"));
                    return FeedResponse.builder()
                            .postId(id)
                            .userId((String) postMap.get("userId"))
                            .content((String) postMap.get("content"))
                            .createdAt(Instant.parse((String) postMap.get("createdAt")))
                            .name(profile!=null?profile.getName():null)
                            .avatarUrl(profile!=null?profile.getAvatarUrl():null)
                            .build();
                } ).toList();

//        long totalElements = redisTemplate.opsForList().size(feedKey);

        long totalElements = Optional.ofNullable(redisTemplate.opsForZSet().zCard(feedKey)).orElse(0L);
        int totalPage = (int) Math.ceil(totalElements/(double) size);

        return PageResponse.<FeedResponse>builder()
                .data(feeds)
                .totalElements(totalElements)
                .currentPage(page)
                .totalPages(totalPage)
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
        log.info("postId"+postIds.toString());
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
}
