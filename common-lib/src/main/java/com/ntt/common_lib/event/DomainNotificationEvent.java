package com.ntt.common_lib.event;

import com.ntt.common_lib.enums.NotificationChannel;
import com.ntt.common_lib.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DomainNotificationEvent {
    String userId;
    String actorId;
    String postId;
    NotificationType type;
    NotificationChannel channel;
    String content;
    Instant createdAt;
}

