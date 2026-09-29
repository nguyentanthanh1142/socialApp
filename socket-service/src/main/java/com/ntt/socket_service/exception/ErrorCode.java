package com.ntt.socket_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(11000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(11001, "Invalid message key", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(11002, "Invalid request data", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(11100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(11200, "You do not have permission to access WebSocket session", HttpStatus.FORBIDDEN),

    WEBSOCKET_CONNECTION_FAILED(11400, "WebSocket connection failed", HttpStatus.INTERNAL_SERVER_ERROR),
    SESSION_NOT_FOUND(11401, "WebSocket session not found", HttpStatus.NOT_FOUND),
    MESSAGE_DELIVERY_FAILED(11402, "Failed to deliver message over WebSocket", HttpStatus.INTERNAL_SERVER_ERROR),
    ;

    // Đưa int code lên ĐẦU TIÊN
    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}