package com.ntt.chat_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(50000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(50001, "Invalid message key", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(50002, "Invalid request data", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(50100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(50200, "You do not have permission to access this chat", HttpStatus.FORBIDDEN),

    CONVERSATION_NOT_FOUND(50400, "Chat conversation not found", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTED(50401, "User does not exist in conversation", HttpStatus.NOT_FOUND),
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