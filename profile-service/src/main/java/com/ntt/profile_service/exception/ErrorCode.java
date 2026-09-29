package com.ntt.profile_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(20000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(20001, "Invalid message key", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(20002, "Invalid request data", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(20100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(20200, "You do not have permission to access or modify this profile", HttpStatus.FORBIDDEN),

    PROFILE_NOT_FOUND(20400, "User profile not found", HttpStatus.NOT_FOUND),
    PROFILE_EXISTED(20401, "User profile already exists", HttpStatus.BAD_REQUEST),
    INVALID_DOB(20402, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
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