package com.ntt.feed_service.listener;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.ntt.common_lib.dto.CachedPostDTO;
import com.ntt.common_lib.enums.PostOwnerType;
import com.ntt.common_lib.event.PostCreatedEvent;
import com.ntt.feed_service.cache.UserProfileCacheImpl;
import com.ntt.feed_service.service.FeedCache;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostEventListener {
    UserProfileCacheImpl userProfileCache;
    FeedCache feedCache;

    @KafkaListener(
            topics = "post-created",
            groupId = "feed-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePostCreated(PostCreatedEvent event) {

        var author = userProfileCache.getAuthor(event.getUserId());
        if(author == null) {
            log.warn("Missing author cache for user {}", event.getUserId());
            return;
        }

        CachedPostDTO cachedPostDTO = CachedPostDTO.builder()
                .id(event.getPostId())
                .createdAt(event.getCreatedAt())
                .files(event.getFiles())
                .content(event.getContent())
                .postsOwnerType(PostOwnerType.USER)
                .ownerId(event.getUserId())
                .author(author)
                .build();

         feedCache.pushToFollowersFeed(event.getUserId(), cachedPostDTO);

//        String postKey = POST_KEY_PREFIX + event.getPostId();
//        redisTemplate.opsForHash().put(postKey, "userId", event.getUserId());
//        redisTemplate.opsForHash().put(postKey, "content", event.getContent());
//        redisTemplate.opsForHash().put(postKey, "createdAt", String.valueOf(event.getCreatedAt()));
//
//        try{
//            String filesJson = objectMapper.writeValueAsString(event.getFiles());
//            redisTemplate.opsForHash().put(postKey, "files", filesJson);
//        } catch(JsonProcessingException e)
//        {
//            log.error("Error serializing files", e);
//        }
//
//        List<String> followers = getFollowersSafe(event.getUserId());
//        log.info("Follower: " + followers.toString());
//
//
//        for (String followerId : followers) {
//            String feedKey = FEED_KEY_PREFIX + followerId;
//
//            //This for Redis ZSET
//            redisTemplate.opsForZSet().add(feedKey, event.getPostId(), event.getCreatedAt().toEpochMilli());
//            long size = redisTemplate.opsForZSet().zCard(feedKey);
//            if (size > 1000) {
//                redisTemplate.opsForZSet().removeRange(feedKey, 0, size - 1001);
//            }
//        }
    }
}
