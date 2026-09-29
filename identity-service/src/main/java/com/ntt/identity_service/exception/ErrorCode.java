package com.ntt.identity_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(10000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(10001, "Invalid message key", HttpStatus.BAD_REQUEST),

    // 101xx: Authentication & Token Errors (401 Unauthorized)
    UNAUTHENTICATED(10100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(10101, "Your token has expired", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID(10102, "Your token is invalid", HttpStatus.UNAUTHORIZED),

    // 102xx: Authorization & Permission Errors (403 Forbidden)
    UNAUTHORIZED(10200, "You do not have permission", HttpStatus.FORBIDDEN),
    EMAIL_NOT_VERIFIED(10201, "Email address has not been verified yet", HttpStatus.FORBIDDEN),
    USER_BANNED(10202, "User account is banned", HttpStatus.FORBIDDEN),
    EMAIL_ALREADY_VERIFIED(10203, "Email is already verified", HttpStatus.BAD_REQUEST),

    // 103xx: User Data Validation Errors (400 Bad Request / 404 Not Found)
    USER_NOT_EXISTED(10300, "User does not exist", HttpStatus.NOT_FOUND),
    USER_EXISTED(10301, "User already exists", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(10302, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(10303, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_DOB(10304, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    USER_STATUS_UNCHANGED(10305, "User status is already updated to this state", HttpStatus.BAD_REQUEST),

    // 104xx: Rate Limit Errors (429 Too Many Requests)
    TOO_MANY_REQUESTS(10400, "Too many requests, please try again later", HttpStatus.TOO_MANY_REQUESTS),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.message = message;
        this.code = code;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
