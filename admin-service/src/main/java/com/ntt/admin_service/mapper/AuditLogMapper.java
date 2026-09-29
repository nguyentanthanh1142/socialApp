package com.ntt.admin_service.mapper;

import com.ntt.admin_service.dto.response.AuditLogResponse;
import com.ntt.admin_service.entity.AuditLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {
    AuditLogResponse toAuditLogResponse(AuditLog auditLog);
}
