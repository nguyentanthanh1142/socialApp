package com.ntt.relation_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(90000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(90001, "Invalid message key", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(90002, "Invalid request data", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(90100, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(90200, "You do not have permission to modify this relationship", HttpStatus.FORBIDDEN),

    RELATIONSHIP_NOT_FOUND(90400, "Relationship not found", HttpStatus.NOT_FOUND),
    ALREADY_FOLLOWED(90401, "You are already following this user", HttpStatus.BAD_REQUEST),
    CANNOT_FOLLOW_SELF(90402, "You cannot perform relationship actions on yourself", HttpStatus.BAD_REQUEST),
    USER_BLOCKED(90403, "Cannot perform action because user is blocked", HttpStatus.BAD_REQUEST),
    ;

    // Đã đưa int code lên vị trí ĐẦU TIÊN
    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}