package com.ntt.notification_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(30000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(30001, "Invalid message key", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(30100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(30200, "You do not have permission", HttpStatus.FORBIDDEN),

    CANNOT_SEND_EMAIL(30400, "Cannot send email", HttpStatus.INTERNAL_SERVER_ERROR),
    NOTIFICATION_NOT_FOUND(30401, "Notification not found", HttpStatus.NOT_FOUND),
    TEMPLATE_NOT_FOUND(30402, "Notification template not found", HttpStatus.NOT_FOUND),
    RECIPIENT_INVALID(30403, "Invalid email address or recipient", HttpStatus.BAD_REQUEST),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}