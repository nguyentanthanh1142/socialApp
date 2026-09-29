package com.ntt.common_lib.event.chat;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAvatarUpdatedEvent {
    String userId;
    String name;
    String avatarUrl;
    Instant updatedAt;
}
