package com.ntt.identity_service.dto.response;

import java.time.Instant;
import java.util.Set;

import com.ntt.identity_service.enums.UserStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String password;
    String email;
    boolean emailVerified;
    UserStatus status;
    Instant statusUpdatedAt;
    Set<RoleResponse> roles;
    boolean isFirstLogin;
}
