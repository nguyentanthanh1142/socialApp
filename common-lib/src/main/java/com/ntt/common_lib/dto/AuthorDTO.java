package com.ntt.common_lib.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthorDTO {
    String id;           // userId
    String username;
    String firstName;
    String lastName;
    String avatarUrl;

}
