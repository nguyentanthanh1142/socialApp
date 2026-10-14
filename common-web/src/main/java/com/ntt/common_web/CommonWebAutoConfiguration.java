package com.ntt.common_web;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;

/**
 * Chỉ đăng ký những thứ an toàn để dùng chung toàn service:
 *  - ServiceTokenGenerator (tạo token nội bộ, @Lazy nên service không có key vẫn khởi động được)
 *  - ServiceCallExceptionHandler (đổi lỗi gọi service khác thành HTTP status hợp lý)
 * Interceptor và ErrorDecoder KHÔNG đăng ký ở đây, xem InternalFeignConfiguration.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnClass(RequestInterceptor.class)
public class CommonWebAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    ServiceCallExceptionHandler commonServiceCallExceptionHandler() {
        return new ServiceCallExceptionHandler();
    }

    @Bean
    @Lazy
    @ConditionalOnMissingBean(name = "commonServiceTokenGenerator")
    ServiceTokenGenerator commonServiceTokenGenerator(
            @Value("${spring.application.name:unknown-service}") String serviceName,
            @Value("${jwt.serviceKey:${jwt.signerKey}}") String key) {
        return new ServiceTokenGenerator(serviceName, key);
    }
}
