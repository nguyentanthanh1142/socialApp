package com.ntt.admin_service.configuration;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
public class AuthenticationRequestInterceptor implements RequestInterceptor {

    private static final String COOKIE_NAME = "ADMIN_TOKEN";

    @Override
    public void apply(RequestTemplate requestTemplate) {
        log.info("[Feign Interceptor] Bắt đầu xử lý gán token cho request gọi đi: {}", requestTemplate.url());

        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            log.warn("[Feign Interceptor] Không tìm thấy RequestAttributes hiện tại (RequestContextHolder là null).");
            return;
        }

        HttpServletRequest request = attributes.getRequest();

        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader)) {
            log.info("[Feign Interceptor] Phát hiện Authorization Header có sẵn từ request gốc. Đang chuyển tiếp...");
            requestTemplate.header("Authorization", authHeader);
            return;
        }

        String token = resolveTokenFromCookie(request);
        if (StringUtils.hasText(token)) {
            log.info("[Feign Interceptor] Lấy thành công token từ Cookie [{}]. Đang gán vào Bearer Token...", COOKIE_NAME);
            requestTemplate.header("Authorization", "Bearer " + token);
        } else {
            log.warn("[Feign Interceptor] Cảnh báo: Không tìm thấy Authorization Header lẫn Cookie [{}] trong request gốc!", COOKIE_NAME);
        }
    }

    private String resolveTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            log.debug("[Jwt Cookie] Request không chứa bất kỳ cookie nào.");
            return null;
        }

        log.debug("[Jwt Cookie] Đang quét tổng số {} cookie có trong request...", cookies.length);
        for (Cookie cookie : cookies) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                log.debug("[Jwt Cookie] Đã tìm thấy cookie khớp tên: {}", COOKIE_NAME);
                return cookie.getValue();
            }
        }

        log.debug("[Jwt Cookie] Không tìm thấy cookie có tên [{}]", COOKIE_NAME);
        return null;
    }
}