package com.ntt.profile_service.dto.response;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RelationStatusResponse {
    String targetUserId;
    RelationStatus status;
    boolean isIssuer;
    boolean isFollowing;
    boolean isBlocked;
    String updatedAt;
    List<String> availableActions;
}
