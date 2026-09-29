package com.ntt.feed_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(60000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(60001, "Invalid message key", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(60002, "Invalid request data", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(60100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(60200, "You do not have permission to perform this action", HttpStatus.FORBIDDEN),

    POST_NOT_FOUND(60400, "Post not found", HttpStatus.NOT_FOUND),
    COMMENT_NOT_FOUND(60401, "Comment not found", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTED(60402, "User does not exist", HttpStatus.NOT_FOUND),
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