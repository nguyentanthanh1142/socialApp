package com.ntt.identity_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.PageResponse;
import com.ntt.identity_service.dto.request.UserStatusUpdateRequest;
import com.ntt.identity_service.dto.response.UserResponse;
import com.ntt.identity_service.dto.response.UserStatsResponse;
import com.ntt.identity_service.service.UserService;

import jakarta.validation.Valid;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/admin/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminUserController {
    UserService userService;

    @GetMapping
    ApiResponse<PageResponse<UserResponse>> getUsers(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<UserResponse>>builder()
                .result(userService.getUsersPaginated(page, size))
                .build();
    }

    @GetMapping("/stats")
    ApiResponse<UserStatsResponse> getStats() {
        return ApiResponse.<UserStatsResponse>builder()
                .result(userService.getUserStats())
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserByIdForAdmin(userId))
                .build();
    }

    @PatchMapping("/{userId}/status")
    ApiResponse<UserResponse> updateStatus(
            @PathVariable String userId, @RequestBody @Valid UserStatusUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUserStatus(userId, request))
                .build();
    }
}
