package com.ntt.profile_service.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileResponse {
    String id;
    String userId;
    String username;
    String firstName;
    String lastName;
    String fullName;

    String avatarUrl;
    String coverUrl;
    String bio;

    String currentCity;
    String hometown;
    String country;

    LocalDate birthday;
    String preferredTheme;
}

