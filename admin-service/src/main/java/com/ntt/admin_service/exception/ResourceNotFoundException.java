package com.ntt.admin_service.exception;

import lombok.Getter;

@Getter
public class ResourceNotFoundException extends AppException {
    private final String resourceName;
    private final String resourceId;

    public ResourceNotFoundException(String resourceName, String resourceId) {
        super(ErrorCode.RESOURCE_NOT_FOUND,
                String.format("%s not found with id: %s", resourceName, resourceId));
        this.resourceName = resourceName;
        this.resourceId = resourceId;
    }
}
