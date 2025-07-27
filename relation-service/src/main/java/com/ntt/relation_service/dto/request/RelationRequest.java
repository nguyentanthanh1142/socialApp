package com.ntt.relation_service.dto.request;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RelationRequest {
    String status; // e.g., "pending", "accepted", "blocked"

    @Size(min = 1)
    @NotNull
    List<String> participantIds;

}
