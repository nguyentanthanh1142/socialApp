package com.ntt.profile_service.cache;


import com.ntt.common_lib.cache.UserProfileCache;
import com.ntt.common_lib.dto.UserProfileDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UserProfileCacheImpl implements UserProfileCache {
    private final RedisTemplate<String, Object> userProfileRedisTemplate;
    public UserProfileCacheImpl(RedisTemplate<String, Object> userProfileRedisTemplate) {
        this.userProfileRedisTemplate = userProfileRedisTemplate;
    }
    @Override
    public UserProfileDTO getUserProfile(String userId) {
        return null;
    }

    @Override
    public void putUserProfile(UserProfileDTO userProfile) {
        userProfileRedisTemplate.opsForValue().set("user:profile:" + userProfile.getUserId(), userProfile);
        log.info("Put user profile into Redis: userId={}, name={}", userProfile.getUserId(), userProfile.getName());
    }
}
