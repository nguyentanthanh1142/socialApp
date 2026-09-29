package com.ntt.admin_service.dto.response;

import java.time.Instant;
import java.util.Set;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserResponse {
    String id;
    String username;
    String email;
    boolean emailVerified;
    String status;
    Instant statusUpdatedAt;
    Set<RoleResponse> roles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RoleResponse {
        String name;
        String description;
    }
}
