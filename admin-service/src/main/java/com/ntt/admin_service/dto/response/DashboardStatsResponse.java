package com.ntt.admin_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardStatsResponse {
    long totalUsers;
    long activeUsers;
    long bannedUsers;
    long totalPosts;
    long activePosts;
    long deletedPosts;
}
