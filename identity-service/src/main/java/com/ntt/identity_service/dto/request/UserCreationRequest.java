package com.ntt.identity_service.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

import com.ntt.identity_service.validator.DobConstraint;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    String id;

    @Size(min = 5, message = "USERNAME_INVALID")
    String username;

    @Size(min = 7, message = "PASSWORD_INVALID")
    String password;

    String lastname;
    String firstname;
    String email;
    @DobConstraint(min = 16, message = "INVALID_DOB")
    LocalDate birthday;
    String city;
}
