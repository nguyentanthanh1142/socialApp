package com.ntt.admin_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuditLogResponse {
    String id;
    String adminId;
    String adminUsername;
    String action;
    String targetType;
    String targetId;
    String details;
    boolean success;
    Instant timestamp;
}