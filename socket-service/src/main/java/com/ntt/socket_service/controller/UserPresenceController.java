package com.ntt.socket_service.controller;


import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.socket_service.service.UserPresenceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/presence")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserPresenceController {
    UserPresenceService userPresenceService;

    @PostMapping("/batch")
    public ApiResponse<Map<String, Map<String, Object>>> getPresencesByList(@RequestBody List<String> userIds) {
        return ApiResponse.<Map<String, Map<String, Object>>>builder()
                .result(userPresenceService.getPresencesByUserIds(userIds))
                .build();
    }
}
