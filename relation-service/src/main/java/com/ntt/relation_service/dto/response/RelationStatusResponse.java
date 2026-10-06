package com.ntt.relation_service.dto.response;
import com.ntt.relation_service.enums.RelationAction;
import com.ntt.relation_service.enums.RelationStatus;
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
    List<RelationAction> availableActions;
}
