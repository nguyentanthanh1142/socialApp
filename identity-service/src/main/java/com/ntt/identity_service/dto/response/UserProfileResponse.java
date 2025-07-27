 package com.ntt.identity_service.dto.response;

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
     String lastname;
     String firstname;
     LocalDate birthday;
     String city;
     String username;
     String email;
     boolean noPassword;

 }
