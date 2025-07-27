 package com.ntt.post_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

 @Data
 @NoArgsConstructor
 @AllArgsConstructor
 @Builder
 @FieldDefaults(level = AccessLevel.PRIVATE)
 public class UserProfileResponse {
     String id;
     String username;
     String lastname;
     String firstname;
     LocalDate birthday;
     String city;
 }
