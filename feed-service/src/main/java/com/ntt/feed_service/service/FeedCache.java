package com.ntt.feed_service.service;

import com.ntt.common_lib.dto.CachedPostDTO;
import com.ntt.common_lib.enums.PostPrivacy;
import com.ntt.feed_service.repository.httpClient.RelationClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedCache {

    RelationClient relationClient;
    RedisTemplate<String, CachedPostDTO> cachedPostDTORedisTemplate;
    RedisTemplate<String, String> redisTemplate;

    private static final String FEED_KEY_PREFIX = "feed:zset:";
    private static final String POST_KEY_PREFIX = "cached_post:";
    private static final int MAX_FEED_SIZE = 1000;

    public void pushToFollowersFeed(String userId, CachedPostDTO cachedPostDTO) {

        String postKey = POST_KEY_PREFIX + cachedPostDTO.getId();
        cachedPostDTORedisTemplate.opsForValue().set(postKey, cachedPostDTO);

        List<String> targetUsers = new ArrayList<>();
        targetUsers.add(userId);

        if(cachedPostDTO.getPrivacy().equals(PostPrivacy.PUBLIC))
        {
            List<String> followers = getFollowers(userId);
            targetUsers.addAll(followers);
        } else if (cachedPostDTO.getPrivacy().equals(PostPrivacy.FRIENDS)) {
            List<String> followers = getFollowers(userId);
            targetUsers.addAll(followers);
        } else if (cachedPostDTO.getPrivacy().equals(PostPrivacy.PRIVATE)) {
            targetUsers.clear();
            targetUsers.add(userId);
        }

        double score = cachedPostDTO.getCreatedAt().toEpochMilli();

        List<String> uniqueTargetUsers = targetUsers.stream().distinct().toList();

        for(String follower : uniqueTargetUsers) {
            String feedKey = FEED_KEY_PREFIX + follower;
            redisTemplate.opsForZSet().add(feedKey, cachedPostDTO.getId(), score);

            long size = Objects.requireNonNullElse(redisTemplate.opsForZSet().zCard(feedKey), 0L);
            if (size > MAX_FEED_SIZE ){
                redisTemplate.opsForZSet().removeRange(feedKey, 0, size - MAX_FEED_SIZE - 1);
            }
        }
    }

    public void updateCachedPost(CachedPostDTO cachedPostDTO)
    {
        String postKey = POST_KEY_PREFIX + cachedPostDTO.getId();
        cachedPostDTORedisTemplate.opsForValue().set(postKey, cachedPostDTO);

        if (cachedPostDTO.getPrivacy() != null && cachedPostDTO.getPrivacy().equals(PostPrivacy.PRIVATE)) {
            List<String> followers = getFollowers(cachedPostDTO.getOwnerId());
            for (String follower : followers) {
                String feedKey = FEED_KEY_PREFIX + follower;
                redisTemplate.opsForZSet().remove(feedKey, cachedPostDTO.getId());
            }
        }
    }

    public void removePostFromFeed(String userId, String postId) {
        String postKey = POST_KEY_PREFIX + postId;
        cachedPostDTORedisTemplate.delete(postKey);

        List<String> targetUsers = new ArrayList<>();
        targetUsers.add(userId);
        List<String> followers = getFollowers(userId);
        targetUsers.addAll(followers);

        List<String> uniqueTargetUsers = targetUsers.stream().distinct().toList();

        for (String targetUser : uniqueTargetUsers) {
            String feedKey = FEED_KEY_PREFIX + targetUser;
            redisTemplate.opsForZSet().remove(feedKey, postId);
        }
    }

    private List<String> getFollowers(String userId) {
        try{
            return relationClient.getFollowers(userId).getResult();
        }
        catch (Exception e){
            return List.of();
        }
    }
}
