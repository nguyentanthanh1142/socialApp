package com.ntt.file_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(70000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(70001, "Invalid message key", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(70100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(70200, "You do not have permission to access or modify this file", HttpStatus.FORBIDDEN),

    FILE_NOT_FOUND(70400, "Cannot get file or file not found", HttpStatus.NOT_FOUND),
    FILE_UPLOAD_FAILED(70401, "Failed to upload file to cloud storage", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_FILE_FORMAT(70402, "Invalid file format or extension", HttpStatus.BAD_REQUEST),
    FILE_SIZE_EXCEEDED(70403, "File size exceeds the allowable limit", HttpStatus.BAD_REQUEST),
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