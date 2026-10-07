package com.ntt.feed_service.listener;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.ntt.common_lib.dto.CachedPostDTO;
import com.ntt.common_lib.enums.PostOwnerType;
import com.ntt.common_lib.event.PostCreatedEvent;
import com.ntt.common_lib.event.PostDeletedEvent;
import com.ntt.common_lib.event.PostUpdatedEvent;
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

        if(event.getUserId() == null || event.getPostId() == null) {
            log.warn("Missing userId or postId in PostCreatedEvent: {}", event);
            return;
        }

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
                .privacy(event.getPrivacy())
                .build();

         feedCache.pushToFollowersFeed(event.getUserId(), cachedPostDTO);
    }
    @KafkaListener(
            topics = "post-updated",
            groupId = "feed-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePostUpdated(PostUpdatedEvent event) {
        if(event.getUserId() == null || event.getPostId() == null) {
            log.warn("Missing userId or postId in PostCreatedEvent: {}", event);
            return;
        }

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
                .privacy(event.getPrivacy())
                .build();

        feedCache.updateCachedPost(cachedPostDTO);
    }
    @KafkaListener(
            topics = "post-deleted",
            groupId = "feed-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePostDeleted(PostDeletedEvent event) {
        if(event.getUserId() == null || event.getPostId() == null) {
            log.warn("Missing userId or postId in PostDeletedEvent: {}", event);
            return;
        }

        feedCache.removePostFromFeed(event.getUserId(), event.getPostId());
        log.info("Successfully removed deleted post {} from Redis feeds", event.getPostId());
    }
}
