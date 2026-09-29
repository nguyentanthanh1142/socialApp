package com.ntt.profile_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OnboardingRequest {
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    String firstName;

    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    String lastName;

    @Pattern(regexp = "^$|^[0-9]{7,20}$", message = "Phone number must be between 7 and 20 digits")
    String phoneNumber;

    @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
    String avatarUrl;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    String bio;

    @Size(max = 100, message = "Current city must not exceed 100 characters")
    String currentCity;

    @Size(max = 100, message = "Hometown must not exceed 100 characters")
    String hometown;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    String country;

    LocalDate birthday;

    @Pattern(regexp = "^(light|dark)$", message = "Preferred theme must be either 'light' or 'dark'")
    String preferredTheme;
}
