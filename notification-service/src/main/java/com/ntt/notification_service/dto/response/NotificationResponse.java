package com.ntt.notification_service.dto.response;


import com.ntt.common_lib.dto.ActorDTO;
import com.ntt.common_lib.dto.EntityDTO;
import com.ntt.common_lib.enums.NotificationType;
import com.ntt.notification_service.dto.Actor;
import com.ntt.notification_service.dto.Entity;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    ActorDTO actor;
    NotificationType type;
    EntityDTO entity;
    boolean read;
    String content;
    Instant createdAt;
}
