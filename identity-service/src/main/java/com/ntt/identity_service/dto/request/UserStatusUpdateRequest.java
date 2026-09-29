package com.ntt.identity_service.dto.request;

import com.ntt.identity_service.enums.UserStatus;

import jakarta.validation.constraints.NotNull;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserStatusUpdateRequest {
    @NotNull
    UserStatus status;
}
