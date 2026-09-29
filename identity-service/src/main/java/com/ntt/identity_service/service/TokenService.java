package com.ntt.identity_service.service;

import com.ntt.identity_service.dto.request.VerifyEmailRequest;
import com.ntt.identity_service.dto.response.VerifyEmailResponse;
import com.ntt.identity_service.exception.AppException;
import com.ntt.identity_service.exception.ErrorCode;
import com.ntt.identity_service.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TokenService {

    static long TOKEN_EXPIRES_IN_MINUTES = 15;
    static final long RESEND_COOLDOWN_IN_SECONDS = 60;
    StringRedisTemplate redisTemplate;

    public String generateVerificationToken(String userId){
        revokeOldToken(userId);

        String token = UUID.randomUUID().toString();
        String tokenKey = "verify:token:" + token;
        String userKey = "verify:user:" + userId;

        redisTemplate.opsForValue().set(tokenKey, userId, TOKEN_EXPIRES_IN_MINUTES, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(userKey, token, TOKEN_EXPIRES_IN_MINUTES, TimeUnit.MINUTES);
        return token;
    }

    public String verifyToken(String token){
        String tokenKey = "verify:token:" + token;
        return redisTemplate.opsForValue().get(tokenKey);
    }



    public void invalidToken(String token) {
        String tokenKey = "verify:token:" + token;
        String userId = redisTemplate.opsForValue().get(tokenKey);

        if (userId != null) {
            redisTemplate.delete(tokenKey);
            redisTemplate.delete("verify:user:" + userId);
        }
    }

    public boolean hasResendCooldown(String email) {
        String cooldownKey = "resend_cooldown:" + email;
        return Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey));
    }

    public void setResendCooldown(String email)
    {
        String key = "resend_cooldown:" + email;
        redisTemplate.opsForValue().set(key, "ACTIVE", RESEND_COOLDOWN_IN_SECONDS, TimeUnit.SECONDS);
    }

    private void revokeOldToken(String userId)
    {
        String userKey = "verify:" + userId;
        String oldToken = redisTemplate.opsForValue().get(userKey);
        if(oldToken != null) {
            log.info("Revoking old verification token for userId: {}", userId);
            redisTemplate.delete("verify:token:" + oldToken);
            redisTemplate.delete(userKey);
        }
    }
}
