package com.ntt.admin_service.entity;

import java.time.Instant;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuditLog {
    @MongoId
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
