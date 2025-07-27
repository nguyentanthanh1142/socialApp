package com.ntt.relation_service.entity;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.List;


@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor

@FieldDefaults(level = AccessLevel.PRIVATE)
public class Relation {

    @MongoId
    String id;
    String ownerId; // User ID of the owner of the relation
    String status; // e.g., "PENDING", "accepted", "blocked"
    @Indexed(unique = true)
    String participantsHash;
    List<ParticipantInfo> participants;
    @Indexed
    Instant createdDate;
    Instant modifiedDate;

}
