package com.ntt.identity_service.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {

    @NotBlank(message = "EMAIL_IS_REQUIRED")
    @Email(message = "EMAIL_INVALID")
    String email;

    @NotBlank(message = "USERNAME_IS_REQUIRED")
    @Size(min = 5, message = "USERNAME_INVALID")
    String username;

    @NotBlank(message = "PASSWORD_IS_REQUIRED")
    @Size(min = 7, message = "PASSWORD_INVALID")
    String password;
}
