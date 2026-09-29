package com.ntt.admin_service.service;

import com.ntt.admin_service.dto.response.AuditLogResponse;
import com.ntt.admin_service.entity.AuditLog;
import com.ntt.admin_service.mapper.AuditLogMapper;
import com.ntt.admin_service.repository.AuditLogRepository;

import com.ntt.common_lib.dto.PageResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuditLogService {

    AuditLogRepository auditLogRepository;
    AuditLogMapper auditLogMapper;


    @Transactional
    public AuditLog save(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }

    public PageResponse<AuditLogResponse> getRecentLogs(int page, int size) {

        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by("timestamp").descending());
        Page<AuditLog> auditLogs = auditLogRepository.findAll(pageable);

        List<AuditLogResponse> logResponses = auditLogs.getContent().stream()
                .map(auditLogMapper::toAuditLogResponse)
                .toList();

        return PageResponse.<AuditLogResponse>builder()
                .currentPage(auditLogs.getNumber() + 1)
                .totalPages(auditLogs.getTotalPages())
                .pageSize(auditLogs.getSize())
                .totalElements(auditLogs.getTotalElements())
                .hasNext(auditLogs.hasNext())
                .data(logResponses)
                .build();}
}
