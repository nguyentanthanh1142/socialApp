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
    StringRedisTemplate redisTemplate;

    public String generateVerificationToken(String userId){
        String token = UUID.randomUUID().toString();
        String key = "verify:" + token;

        redisTemplate.opsForValue().set(key,userId,TOKEN_EXPIRES_IN_MINUTES, TimeUnit.MINUTES);
        return token;
    }

    public String verifyToken(String token){
        String key = "verify:" + token;
        return redisTemplate.opsForValue().get(key);
    }



    public void invalidToken(String token) {
        redisTemplate.delete("verify:" + token);
    }
}
