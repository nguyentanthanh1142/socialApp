package com.ntt.profile_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserOnboardingRequest {
    String userId;
    String firstName;
    String lastName;
    String bio;
    String currentCity;
    String hometown;
    String country;
    LocalDate birthday;
    String phoneNumber;
    String avatarUrl;
    String preferredTheme;
}
