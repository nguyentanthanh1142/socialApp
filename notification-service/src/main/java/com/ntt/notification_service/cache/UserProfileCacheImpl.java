package com.ntt.notification_service.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ntt.common_lib.cache.UserProfileCache;
import com.ntt.common_lib.dto.AuthorDTO;
import com.ntt.common_lib.dto.UserProfileDTO;
import com.ntt.notification_service.dto.response.UserProfileResponse;
import com.ntt.notification_service.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileCacheImpl implements UserProfileCache {

    ObjectMapper objectMapper;
    ProfileClient profileClient;

    RedisTemplate<String, UserProfileDTO> userProfileRedisTemplate;

    private static final String USER_PROFILE_KEY = "user:profile:";
    private static final Duration TTL = Duration.ofHours(6);

    @Override
    public UserProfileDTO getUserProfile(String userId) {
        return getFromCacheOrLoad(userId);
    }

    @Override
    public void putUserProfile(UserProfileDTO userProfile) {
        userProfileRedisTemplate.opsForValue().set(USER_PROFILE_KEY + userProfile.getUserId(), userProfile, TTL);
        log.info("Put user profile into Redis: userId={}, name={}", userProfile.getUserId(), userProfile.getName());
    }

    public AuthorDTO getAuthor(String userId)
    {
        UserProfileDTO profile = getFromCacheOrLoad(userId);
            if (profile == null) return null;
        return AuthorDTO.builder()
                .id(profile.getUserId())
                .username(profile.getName())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .avatarUrl(profile.getAvatarUrl())
                .build();
    }

    private UserProfileDTO getFromCacheOrLoad(String userId)
    {
        String key = USER_PROFILE_KEY + userId;
        Object profileCache = userProfileRedisTemplate.opsForValue().get(key);

        if(profileCache != null) {
            userProfileRedisTemplate.expire(key, TTL);
            if (profileCache instanceof UserProfileDTO dto) {
                return dto;
            }
            else if (profileCache instanceof Map) {
                return objectMapper.convertValue(profileCache, UserProfileDTO.class);
            }
        }
        try
        {
            UserProfileResponse profile = profileClient.getProfile(userId).getResult();
            if (profile == null) return getFallbackProfile(userId);

            UserProfileDTO userProfileDTO = maptoDTO(profile);

            userProfileRedisTemplate.opsForValue().set(key, userProfileDTO, TTL);
            return userProfileDTO;
        }
        catch (Exception e)
        {
            log.error("Failed to load user profile for userId={}", userId, e);
            return getFallbackProfile(userId);
        }
    }

    private UserProfileDTO maptoDTO(UserProfileResponse profile)
    {
        return UserProfileDTO.builder()
                .userId(profile.getUserId())
                .firstName(profile.getFirstname())
                .lastName(profile.getLastname())
                .name(profile.getUsername())
                .avatarUrl(profile.getAvatar())
                .build();
    }

    private UserProfileDTO getFallbackProfile(String userId)
    {
        return UserProfileDTO.builder()
                .userId(userId)
                .name("Người dùng")
                .avatarUrl(null)
                .build();
    }
}
