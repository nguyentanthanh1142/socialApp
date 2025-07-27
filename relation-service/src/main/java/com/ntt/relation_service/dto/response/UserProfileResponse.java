package com.ntt.relation_service.dto.response;


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
    String lastname;
    String firstname;
    LocalDate birthday;
    String city;
    String avatar;
    String email;
    String username;
}

