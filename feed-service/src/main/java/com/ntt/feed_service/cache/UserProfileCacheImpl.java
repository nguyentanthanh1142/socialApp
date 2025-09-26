package com.ntt.feed_service.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ntt.common_lib.cache.UserProfileCache;
import com.ntt.common_lib.dto.UserProfileDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class UserProfileCacheImpl implements UserProfileCache {

    @Autowired
    private ObjectMapper objectMapper;

    private final RedisTemplate<String, Object> userProfileRedisTemplate;

    public UserProfileCacheImpl(RedisTemplate<String, Object> userProfileRedisTemplate) {
        this.userProfileRedisTemplate = userProfileRedisTemplate;
    }

    @Override
    public UserProfileDTO getUserProfile(String userId) {
        log.info("get user profile  Redis: userId={}", userId );
        Object profileCache = userProfileRedisTemplate.opsForValue().get("user:profile:" + userId);
        log.info("get user profile  Redis: userId={}, profile = {}", userId, profileCache);
        if (profileCache instanceof UserProfileDTO dto) {
            return dto;
        } else if (profileCache instanceof Map) {
            return objectMapper.convertValue(profileCache, UserProfileDTO.class);
        }
        return null;
    }

    @Override
    public void putUserProfile(UserProfileDTO userProfile) {
        userProfileRedisTemplate.opsForValue().set("user:profile:" + userProfile.getUserId(), userProfile);
        log.info("Put user profile into Redis: userId={}, name={}", userProfile.getUserId(), userProfile.getName());
    }
}
