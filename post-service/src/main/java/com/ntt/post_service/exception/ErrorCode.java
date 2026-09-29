package com.ntt.post_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(80000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(80001, "Invalid message key", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(80002, "Invalid request data", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(80100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(80200, "You do not have permission to perform this action on the post", HttpStatus.FORBIDDEN),

    POST_NOT_FOUND(80400, "Post not found", HttpStatus.NOT_FOUND),
    POST_ALREADY_DELETED(80401, "Post is already deleted", HttpStatus.BAD_REQUEST),
    POST_ACCESS_DENIED(80402, "Access denied to this post content", HttpStatus.FORBIDDEN),
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