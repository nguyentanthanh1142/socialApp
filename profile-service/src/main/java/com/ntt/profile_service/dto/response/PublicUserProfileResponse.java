package com.ntt.profile_service.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PublicUserProfileResponse {

    String userId;
    String username;
    String fullName;

    String avatarUrl;
    String coverUrl;
    String bio;

    String currentCity;
    String hometown;
    String country;

    long followerCount;
    long followingCount;

    Boolean isFollowing;
    Boolean isSelf;
}
