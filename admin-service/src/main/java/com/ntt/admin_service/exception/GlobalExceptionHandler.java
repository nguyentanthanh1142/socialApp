package com.ntt.admin_service.exception;

import java.util.Map;
import java.util.Objects;

import com.ntt.common_lib.dto.ApiResponse;

import jakarta.validation.ConstraintViolation;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String MIN_ATTRIBUTE = "min";

    @ExceptionHandler(ResourceNotFoundException.class)
    public Object handleResourceNotFound(ResourceNotFoundException ex, jakarta.servlet.http.HttpServletRequest request) {
        if (isHtmlRequest(request)) {
            ModelAndView mav = new ModelAndView("error");
            mav.addObject("status", 404);
            mav.addObject("message", ex.getMessage());
            return mav;
        }
        return ResponseEntity.status(ex.getErrorCode().getStatusCode())
                .body(ApiResponse.builder()
                        .code(ex.getErrorCode().getCode())
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(AppException.class)
    public Object handleAppException(AppException ex, jakarta.servlet.http.HttpServletRequest request) {
        if (isHtmlRequest(request)) {
            ModelAndView mav = new ModelAndView("error");
            mav.addObject("status", ex.getErrorCode().getStatusCode().value());
            mav.addObject("message", ex.getMessage());
            return mav;
        }
        return ResponseEntity.status(ex.getErrorCode().getStatusCode())
                .body(ApiResponse.builder()
                        .code(ex.getErrorCode().getCode())
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException ex) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        String key = Objects.requireNonNull(ex.getFieldError()).getDefaultMessage();
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
        Map<String, Object> attributes = null;
        try {
            errorCode = ErrorCode.valueOf(key);
            var violation = ex.getBindingResult().getAllErrors().getFirst().unwrap(ConstraintViolation.class);
            attributes = violation.getConstraintDescriptor().getAttributes();
        } catch (IllegalArgumentException ignored) {
            // keep default
        }
        String message = attributes != null
                ? mapAttributes(errorCode.getMessage(), attributes)
                : (key != null ? key : errorCode.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.builder().code(errorCode.getCode()).message(message).build());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNoResource(NoResourceFoundException ex) {
        return ResponseEntity.status(ErrorCode.RESOURCE_NOT_FOUND.getStatusCode())
                .body(ApiResponse.builder()
                        .code(ErrorCode.RESOURCE_NOT_FOUND.getCode())
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.badRequest()
                .body(ApiResponse.builder()
                        .code(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode())
                        .message(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage())
                        .build());
    }

    private boolean isHtmlRequest(jakarta.servlet.http.HttpServletRequest request) {
        String accept = request.getHeader("Accept");
        return accept != null && accept.contains("text/html");
    }

    private String mapAttributes(String message, Map<String, Object> attributes) {
        Object min = attributes.get(MIN_ATTRIBUTE);
        if (min == null) {
            return message;
        }
        return message.replace("{" + MIN_ATTRIBUTE + "}", min.toString());
    }
}
