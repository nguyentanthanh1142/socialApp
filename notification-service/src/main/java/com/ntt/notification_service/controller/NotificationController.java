package com.ntt.notification_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.PageResponse;
import com.ntt.notification_service.dto.response.NotificationResponse;
import com.ntt.notification_service.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {

    NotificationService notificationService;

    @GetMapping("/notifications")
    public ApiResponse<PageResponse<NotificationResponse>> getNotifications(
            @RequestParam(value = "page",required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<NotificationResponse>>builder()
                .result(notificationService.getNotifications(page,size))
                .build();
    }
}
