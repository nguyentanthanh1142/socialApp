package com.ntt.common_lib.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileDTO {
    String userId;
    String name;
    String firstName;
    String lastName;
    String avatarUrl;
}
