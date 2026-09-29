package com.ntt.admin_service.dto.response;

import java.time.Instant;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminPostResponse {
    String id;
    String userId;
    String username;
    String content;
    Instant createDate;
    Instant modifiedDate;
    boolean deleted;
    Instant deletedAt;
}
