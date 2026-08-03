package com.ntt.post_service.service;

import com.ntt.common_lib.event.DomainNotificationEvent;
import com.ntt.common_lib.event.PostCreatedEvent;
import com.ntt.post_service.enitity.Post;
import com.ntt.post_service.repository.PostRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LikeService {
    RedisTemplate<String,Object> redisTemplate;
    PostRepository postRepository;
    KafkaTemplate<String, DomainNotificationEvent> kafkaTemplate;


    private static final String LIKE_KEY = "post:likes:";
    private static final String TRACK_KEY = "post:liked_posts";

    public boolean toggleLikes(String postId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String key = LIKE_KEY + postId;
        Boolean isLiked = redisTemplate.opsForSet().isMember(key, userId);


        if (Boolean.TRUE.equals(isLiked)) {
            redisTemplate.opsForSet().remove(key, userId);
            log.info("User {} unliked post {}", userId, postId);
            return false;
        } else {
            redisTemplate.opsForSet().add(key, userId);
            redisTemplate.opsForSet().add(TRACK_KEY, postId);

            Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
            DomainNotificationEvent event = DomainNotificationEvent.builder()
                    .postId(postId)
                    .actorId(userId)
                    .userId(post.getUserId())
                    .content(userId + " liked your post")
                    .createdAt(post.getCreateDate())
                    .build();
            kafkaTemplate.send("post-liked", event);
            return true;
        }
    }
    public Long getLikeCount(String postId) {
        return Optional.ofNullable(redisTemplate.opsForSet().size(LIKE_KEY + postId)).orElse(0L);
    }

    public void syncLikes() {
        Set<Object> postIds = redisTemplate.opsForSet().members(TRACK_KEY);
        if (postIds == null || postIds.isEmpty()) {
            log.info("No posts to sync likes.");
            return;
        }

        log.info("Start syncing {} posts likes from Redis to MongoDB", postIds.size());
        List<Post> updatedPosts = new ArrayList<>();

        for (Object postIdObj : postIds) {
            String postId = postIdObj.toString();
            String key = LIKE_KEY + postId;
            Set<Object> userIds = redisTemplate.opsForSet().members(key);

            if (userIds == null) continue;

            postRepository.findById(postId).ifPresent(post -> {
                Set<String> likeUserIds = userIds.stream().map(Object::toString).collect(Collectors.toSet());
                post.setLikes(likeUserIds);
                updatedPosts.add(post);
            });
        }

        if (!updatedPosts.isEmpty()) {
            postRepository.saveAll(updatedPosts);
            log.info("Synced {} posts likes successfully", updatedPosts.size());
        } else {
            log.info("No posts updated during sync.");
        }
    }
    @Scheduled(fixedRate = 300000)
    public void scheduledSyncLikes() {
        try {
            log.info("Running scheduled sync likes job...");
            syncLikes();
        } catch (Exception e) {
            log.error("Error during scheduled like sync: {}", e.getMessage(), e);
        }
    }
}
