package com.ntt.common_web;

public class ServiceCallException extends RuntimeException {

    private final int downstreamStatus;

    public ServiceCallException(int downstreamStatus, String methodKey) {
        super("Downstream call failed: " + methodKey + " -> HTTP " + downstreamStatus);
        this.downstreamStatus = downstreamStatus;
    }

    public int getDownstreamStatus() {
        return downstreamStatus;
    }
}
