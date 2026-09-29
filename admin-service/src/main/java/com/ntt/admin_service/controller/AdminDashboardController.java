package com.ntt.admin_service.controller;

import com.ntt.admin_service.dto.response.AuditLogResponse;
import com.ntt.admin_service.dto.response.DashboardStatsResponse;
import com.ntt.admin_service.entity.AuditLog;
import com.ntt.admin_service.service.AuditLogService;
import com.ntt.admin_service.service.DashboardService;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.PageResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    DashboardService dashboardService;
    AuditLogService auditLogService;

    @GetMapping
    ApiResponse<DashboardStatsResponse> stats() {
        return ApiResponse.<DashboardStatsResponse>builder()
                .result(dashboardService.getStats())
                .build();
    }
    @GetMapping("/recent-audits")
    public ApiResponse<PageResponse<AuditLogResponse>> getRecentAudits(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int size) {


        return ApiResponse.<PageResponse<AuditLogResponse>>builder()
                .result(auditLogService.getRecentLogs(page, size))
                .build();
    }
}
