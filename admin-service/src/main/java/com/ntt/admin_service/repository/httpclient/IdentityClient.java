package com.ntt.admin_service.repository.httpclient;

import com.ntt.admin_service.configuration.AuthenticationRequestInterceptor;
import com.ntt.admin_service.dto.request.AuthenticationRequest;
import com.ntt.admin_service.dto.request.UserStatusUpdateRequest;
import com.ntt.admin_service.dto.response.AdminUserResponse;
import com.ntt.admin_service.dto.response.AuthenticationResponse;
import com.ntt.admin_service.dto.response.UserStatsResponse;
import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.PageResponse;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "identity-service",
        url = "${app.services.identity}",
        configuration = AuthenticationRequestInterceptor.class)
public interface IdentityClient {

    @PostMapping(value = "/auth/token", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request);

    @GetMapping(value = "/internal/admin/users", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PageResponse<AdminUserResponse>> getUsers(
            @RequestParam("page") int page, @RequestParam("size") int size);

    @GetMapping(value = "/internal/admin/users/stats", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserStatsResponse> getUserStats();

    @GetMapping(value = "/internal/admin/users/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<AdminUserResponse> getUser(@PathVariable("userId") String userId);

    @PatchMapping(value = "/internal/admin/users/{userId}/status", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<AdminUserResponse> updateUserStatus(
            @PathVariable("userId") String userId, @RequestBody UserStatusUpdateRequest request);
}
