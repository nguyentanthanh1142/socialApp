package com.ntt.relation_service.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileCreationRequest {

    String userId;
    String lastname;
    String firstname;
    LocalDate birthday;
    String city;
    String email;
    String username;
    String avatar;
}
