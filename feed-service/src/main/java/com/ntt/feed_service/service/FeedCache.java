package com.ntt.feed_service.service;

import com.ntt.common_lib.dto.CachedPostDTO;
import com.ntt.feed_service.repository.httpClient.RelationClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

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

        List<String> followers = getFollowers(userId);
        double score = cachedPostDTO.getCreatedAt().toEpochMilli();

        for(String follower : followers) {
            String feedKey = FEED_KEY_PREFIX + follower;
            redisTemplate.opsForZSet().add(feedKey, cachedPostDTO.getId(), score);

            long size = Objects.requireNonNullElse(redisTemplate.opsForZSet().zCard(feedKey), 0L);
            if (size > MAX_FEED_SIZE ){
                redisTemplate.opsForZSet().removeRange(feedKey, 0, size - MAX_FEED_SIZE - 1);
            }
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
