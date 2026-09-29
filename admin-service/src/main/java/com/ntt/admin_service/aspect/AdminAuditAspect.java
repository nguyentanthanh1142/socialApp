package com.ntt.admin_service.aspect;

import java.time.Instant;

import com.ntt.admin_service.entity.AuditLog;
import com.ntt.admin_service.service.AuditLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAuditAspect {

    private final AuditLogService auditLogService;
    private final ExpressionParser parser = new SpelExpressionParser();

    @Around("@annotation(audited)")
    public Object auditAdminAction(ProceedingJoinPoint joinPoint, Audited audited) throws Throwable {
        boolean success = false;
        Object result = null;
        Throwable error = null;
        try {
            result = joinPoint.proceed();
            success = true;
            return result;
        } catch (Throwable ex) {
            error = ex;
            throw ex;
        } finally {
            try {
                persistAudit(joinPoint, audited, success, error);
            } catch (Exception e) {
                log.error("Failed to persist audit log: {}", e.getMessage());
            }
        }
    }

    private void persistAudit(ProceedingJoinPoint joinPoint, Audited audited, boolean success, Throwable error) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminId = authentication != null ? authentication.getName() : "anonymous";
        String adminUsername = resolveUsername(authentication);

        String targetId = resolveTargetId(joinPoint, audited.targetId());
        String details = error != null ? error.getMessage() : "OK";

        AuditLog auditLog = AuditLog.builder()
                .adminId(adminId)
                .adminUsername(adminUsername)
                .action(audited.action())
                .targetType(audited.targetType())
                .targetId(targetId)
                .details(details)
                .success(success)
                .timestamp(Instant.now())
                .build();

        auditLogService.save(auditLog);
        log.info(
                "AUDIT action={} adminId={} targetType={} targetId={} success={}",
                audited.action(),
                adminId,
                audited.targetType(),
                targetId,
                success);
    }

    private String resolveUsername(Authentication authentication) {
        if (authentication == null) {
            return "anonymous";
        }
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            Object username = jwt.getClaims().get("username");
            if (username != null) {
                return username.toString();
            }
        }
        return authentication.getName();
    }

    private String resolveTargetId(ProceedingJoinPoint joinPoint, String expression) {
        if (expression == null || expression.isBlank()) {
            return null;
        }
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        EvaluationContext context = new StandardEvaluationContext();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();
        for (int i = 0; i < paramNames.length; i++) {
            context.setVariable(paramNames[i], args[i]);
        }
        Object value = parser.parseExpression(expression).getValue(context);
        return value != null ? value.toString() : null;
    }
}
