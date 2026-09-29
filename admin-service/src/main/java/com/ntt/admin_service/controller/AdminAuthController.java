package com.ntt.admin_service.controller;

import com.ntt.admin_service.dto.request.AdminLoginRequest;
import com.ntt.admin_service.dto.response.AuthenticationResponse;
import com.ntt.admin_service.service.AdminAuthService;

import com.ntt.common_lib.dto.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminAuthController {

    AdminAuthService adminAuthService;

    @Value("${app.jwt.cookie-name:ADMIN_TOKEN}")
    @NonFinal
    String cookieName;

    @PostMapping("/login")
    public ApiResponse<?> login(
            @RequestBody AdminLoginRequest request,
            HttpServletResponse response) {
        AuthenticationResponse auth = adminAuthService.login(request.getUsername(), request.getPassword());

        ResponseCookie cookie = ResponseCookie.from(cookieName, auth.getToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<Void>builder()
                .message("Admin login successful")
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<Void>builder()
                .message("Logged out successfully")
                .build();
    }

    @GetMapping("/check-auth")
    public ApiResponse<Map<String, Boolean>> checkAuth(@CookieValue(name = "${app.jwt.cookie-name:ADMIN_TOKEN}", required = false) String token) {

        boolean isAuthenticated = false;

        if (token != null && !token.trim().isEmpty()) {
            try {
                isAuthenticated = adminAuthService.validateToken(token);
            } catch (Exception e) {
                isAuthenticated = false;
            }
        }

        return ApiResponse.<Map<String, Boolean>>builder()
                .result(Collections.singletonMap("authenticated", isAuthenticated))
                .message("Auth check status")
                .build();
    }
}
