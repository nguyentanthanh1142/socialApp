package com.ntt.admin_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(40000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),

    UNAUTHENTICATED(40100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    LOGIN_FAILED(40101, "Invalid username or password", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(40200, "You do not have permission", HttpStatus.FORBIDDEN),

    RESOURCE_NOT_FOUND(40400, "Resource not found", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND(40401, "User not found", HttpStatus.NOT_FOUND),
    POST_NOT_FOUND(40402, "Post not found", HttpStatus.NOT_FOUND),

    REMOTE_SERVICE_ERROR(40500, "Remote service call failed", HttpStatus.BAD_GATEWAY),
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