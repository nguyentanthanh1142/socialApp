package com.ntt.identity_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthCheckResponse {
    boolean authenticated;
    boolean isFirstLogin;
    UserResponse user;
}
