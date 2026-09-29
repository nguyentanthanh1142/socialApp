package com.ntt.admin_service.service;

import com.ntt.admin_service.dto.response.DashboardStatsResponse;
import com.ntt.admin_service.dto.response.PostStatsResponse;
import com.ntt.admin_service.dto.response.UserStatsResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DashboardService {

    AdminUserService adminUserService;
    AdminPostService adminPostService;

    @PreAuthorize("hasRole('ADMIN')")
    public DashboardStatsResponse getStats() {
        UserStatsResponse userStats = adminUserService.getUserStats();
        PostStatsResponse postStats = adminPostService.getPostStats();
        return DashboardStatsResponse.builder()
                .totalUsers(userStats.getTotalUsers())
                .activeUsers(userStats.getActiveUsers())
                .bannedUsers(userStats.getBannedUsers())
                .totalPosts(postStats.getTotalPosts())
                .activePosts(postStats.getActivePosts())
                .deletedPosts(postStats.getDeletedPosts())
                .build();
    }
}
