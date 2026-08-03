package com.ntt.feed_service.cache;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.ntt.common_lib.dto.CachedPostDTO;
import com.ntt.common_lib.dto.UserProfileDTO;
import com.ntt.common_lib.enums.PostOwnerType;
import com.ntt.feed_service.dto.response.PostResponse;
import com.ntt.feed_service.repository.httpClient.PostClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostCacheService {

    RedisTemplate<String, CachedPostDTO> redisTemplate;
    PostClient postClient;
    UserProfileCacheImpl userProfileCache;
    ObjectMapper objectMapper;

    private static final String POST_KEY_PREFIX = "cached_post:";
    private static final Duration TTL = Duration.ofMinutes(30);

    public CachedPostDTO getPost(String postId) {
        String key = POST_KEY_PREFIX + postId;
        CachedPostDTO cachedPost = redisTemplate.opsForValue().get(key);
        if(cachedPost != null)
        {
            if (cachedPost instanceof CachedPostDTO dto) {
                return dto;
            }
            else if (cachedPost instanceof Map) {
                return objectMapper.convertValue(cachedPost, CachedPostDTO.class);
            }
        }
        try
        {
            PostResponse post = postClient.getPost(postId).getResult();
            if (post == null) return null;

            CachedPostDTO cachedPostDTO = CachedPostDTO.builder()
                    .id(post.getId())
                    .createdAt(post.getCreateDate())
                    .files(post.getFiles())
                    .postsOwnerType(PostOwnerType.USER)
                    .ownerId(post.getUserId())
                    .content(post.getContent())
                    .author(userProfileCache.getAuthor(post.getUserId()))
                    .build();
            redisTemplate.opsForValue().set(key, cachedPostDTO, TTL);
            return cachedPostDTO;
        }
        catch (Exception e)
        {
            log.error("Failed to load cached post for postId={}", postId,e);
            return null;
        }
    }
}
