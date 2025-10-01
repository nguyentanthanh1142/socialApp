package com.ntt.feed_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedResponse {
    String postId;
    String userId;
    String avatarUrl;
    String name;
    String content;
    Instant createdAt;
    boolean isRead = false;
}
