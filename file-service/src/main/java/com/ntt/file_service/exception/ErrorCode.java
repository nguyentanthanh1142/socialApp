package com.ntt.file_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    INVALID_KEY("Invalid message", 10001, HttpStatus.INTERNAL_SERVER_ERROR),
    UNCATEGORIZED_EXCEPTION("Uncategorized error", 999, HttpStatus.BAD_REQUEST),
    USER_EXISTED("User existed", 1002, HttpStatus.BAD_REQUEST),
    USERNAME_INVALID("Username must be at least {min} characters", 1003, HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID("Password must be at least {min} characters", 1004, HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED("Username not existed", 1005, HttpStatus.NOT_FOUND),
    UNAUTHENTICATED("Unauthenticated", 1006, HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("You do not have permission", 1007, HttpStatus.FORBIDDEN),
    CANNOT_SEND_EMAIL("Can not send email", 1007, HttpStatus.FORBIDDEN),
    FILE_NOT_FOUND("Can not get file", 1009, HttpStatus.NOT_FOUND),
    INVALID_DOB("Your age must be at least {min}", 1008, HttpStatus.BAD_REQUEST);

    ErrorCode(String message, int code, HttpStatusCode statusCode) {
        this.message = message;
        this.code = code;
        this.statusCode = statusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;
}
