package com.ntt.relation_service.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SuggestionResponse {
    private String userId;
    String username;
    String fullName;
    String avatarUrl;


    int mutualFriendsCount;
    List<String> mutualFriendNames;

    String headline;
    String suggestionReason;

}
