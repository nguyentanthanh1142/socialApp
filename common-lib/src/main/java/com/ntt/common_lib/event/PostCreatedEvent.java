package com.ntt.common_lib.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostCreatedEvent {
    String postId;
    String userId;
    String content;
    Instant createdAt;
}
