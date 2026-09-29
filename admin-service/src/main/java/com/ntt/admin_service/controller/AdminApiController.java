package com.ntt.admin_service.controller;

import com.ntt.admin_service.dto.response.AdminPostResponse;
import com.ntt.admin_service.dto.response.AdminUserResponse;
import com.ntt.admin_service.dto.response.DashboardStatsResponse;
import com.ntt.admin_service.service.AdminPostService;
import com.ntt.admin_service.service.AdminUserService;
import com.ntt.admin_service.service.DashboardService;
import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.PageResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminApiController {

    AdminUserService adminUserService;
    AdminPostService adminPostService;
    DashboardService dashboardService;

    @GetMapping("/stats")
    ApiResponse<DashboardStatsResponse> stats() {
        return ApiResponse.<DashboardStatsResponse>builder()
                .result(dashboardService.getStats())
                .build();
    }

    @GetMapping("/users")
    ApiResponse<PageResponse<AdminUserResponse>> users(
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<AdminUserResponse>>builder()
                .result(adminUserService.getUsers(page, size))
                .build();
    }

    @PatchMapping("/users/{userId}/ban")
    ApiResponse<AdminUserResponse> ban(@PathVariable String userId) {
        return ApiResponse.<AdminUserResponse>builder()
                .result(adminUserService.banUser(userId))
                .build();
    }

    @PatchMapping("/users/{userId}/unban")
    ApiResponse<AdminUserResponse> unban(@PathVariable String userId) {
        return ApiResponse.<AdminUserResponse>builder()
                .result(adminUserService.unbanUser(userId))
                .build();
    }

    @GetMapping("/posts")
    ApiResponse<PageResponse<AdminPostResponse>> posts(
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<AdminPostResponse>>builder()
                .result(adminPostService.getPosts(page, size, true))
                .build();
    }

    @DeleteMapping("/posts/{postId}")
    ApiResponse<AdminPostResponse> deletePost(@PathVariable String postId) {
        return ApiResponse.<AdminPostResponse>builder()
                .result(adminPostService.softDeletePost(postId))
                .build();
    }
}
