package com.ntt.common_lib.exception;


public class RemoteServiceException extends RuntimeException{

    private final int httpStatus;
    private final String methodKey;

    public RemoteServiceException(
            String message,
            int httpStatus,
            String methodKey
    ) {
        super(message);
        this.httpStatus = httpStatus;
        this.methodKey = methodKey;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public String getMethodKey() {
        return methodKey;
    }
}
