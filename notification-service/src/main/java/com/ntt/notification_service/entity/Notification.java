package com.ntt.notification_service.entity;


import com.ntt.common_lib.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {

    @MongoId
    String id;
    String userId;
    String actorId;
    String postId;
    NotificationType type;
    boolean read;
    String content;
    Instant createdAt;
    String extraData;

}
