package com.ntt.feed_service.service;


import com.ntt.common_lib.cache.UserProfileCache;
import com.ntt.common_lib.dto.PageResponse;
import com.ntt.common_lib.dto.UserProfileDTO;
import com.ntt.common_lib.event.PostCreatedEvent;
import com.ntt.feed_service.cache.UserProfileCacheImpl;
import com.ntt.feed_service.dto.response.FeedResponse;
import com.ntt.feed_service.repository.httpClient.RelationClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedService {

    RedisTemplate<String, Object> redisTemplate;
    RedisTemplate<String, UserProfileDTO> userProfileredisTemplate;
    RelationClient relationClient;
    UserProfileCacheImpl userProfileCache;

    private static final String FEED_KEY_PREFIX = "feed:";
    private static final String POST_KEY_PREFIX = "post:";

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
            redisTemplate.opsForList().leftPush(feedKey, event.getPostId());
            redisTemplate.opsForList().trim(feedKey, 0, 999); // giữ tối đa 1000 bài
        }

    }

    public PageResponse<FeedResponse> getMyFeed(int page, int size) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("userId" + userId);
        String feedKey = FEED_KEY_PREFIX + userId;

        int offset = (page-1) * size;
        int end = offset + size - 1;


        // Lấy danh sách postId trong feed từ Redis List
        List<Object> postIds = redisTemplate.opsForList().range(feedKey, offset, end);
        if (postIds == null || postIds.isEmpty()) {
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

        List<FeedResponse> feeds = postIds.stream()
                .map(id -> {
                    String postKey = POST_KEY_PREFIX + id;
                    Map<Object,Object> postMap = redisTemplate.opsForHash().entries(postKey);
                    UserProfileDTO profile = userProfileCache.getUserProfile((String)postMap.get("userId"));
                    return FeedResponse.builder()
                            .postId((String)id)
                            .userId((String) postMap.get("userId"))
                            .content((String) postMap.get("content"))
                            .createdAt(Instant.parse((String) postMap.get("createdAt")))
                            .name(profile!=null?profile.getName():null)
                            .avatarUrl(profile!=null?profile.getAvatarUrl():null)
                            .build();
                } ).toList();


        long totalElements = redisTemplate.opsForList().size(feedKey);
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
        List<String> followers = getFollowersSafe(userId);
        log.info("Follower: " + followers.toString());
        return followers;
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
