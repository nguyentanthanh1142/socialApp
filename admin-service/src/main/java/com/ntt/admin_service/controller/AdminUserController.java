package com.ntt.admin_service.controller;

import com.ntt.admin_service.dto.response.AdminUserResponse;
import com.ntt.admin_service.service.AdminUserService;
import com.ntt.common_lib.dto.PageResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminUserResponse> users = adminUserService.getUsers(page, size);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/{userId}/ban")
    public ResponseEntity<?> banUser(@PathVariable String userId) {
        adminUserService.banUser(userId);
        return ResponseEntity.ok("User banned successfully");
    }

    @PostMapping("/{userId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable String userId) {
        adminUserService.unbanUser(userId);
        return ResponseEntity.ok("User unbanned successfully");
    }
}
