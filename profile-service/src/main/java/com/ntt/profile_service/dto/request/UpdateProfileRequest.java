package com.ntt.profile_service.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateProfileRequest {
    String username;
    String firstName;
    String lastName;

    @Size(max = 250, message = "BIO_TOO_LONG")
    String bio;

    String currentCity;
    String hometown;
    String country;

    LocalDate birthday;
}
