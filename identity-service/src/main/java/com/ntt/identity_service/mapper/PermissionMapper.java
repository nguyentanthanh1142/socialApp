package com.ntt.identity_service.mapper;

import org.mapstruct.Mapper;

import com.ntt.identity_service.dto.request.PermissionRequest;
import com.ntt.identity_service.dto.response.PermissionResponse;
import com.ntt.identity_service.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
    //    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
