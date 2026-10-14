package com.ntt.common_web;

import com.ntt.common_lib.dto.ApiResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ServiceCallExceptionHandler {

    @ExceptionHandler(ServiceCallException.class)
    ResponseEntity<ApiResponse<?>> handle(ServiceCallException e) {
        int d = e.getDownstreamStatus();
        HttpStatus status;
        String message;
        if (d == 404) {
            status = HttpStatus.NOT_FOUND;
            message = "Resource not found";
        } else if (d == 401) {
            status = HttpStatus.UNAUTHORIZED;
            message = "Unauthenticated";
        } else if (d == 403) {
            status = HttpStatus.FORBIDDEN;
            message = "You do not have permission";
        } else if (d >= 400 && d < 500) {
            status = HttpStatus.BAD_REQUEST;
            message = "Bad request to downstream service";
        } else {
            status = HttpStatus.BAD_GATEWAY;
            message = "Downstream service unavailable";
        }
        ApiResponse<?> body = ApiResponse.builder()
                .code(status.value() * 10)
                .message(message)
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
