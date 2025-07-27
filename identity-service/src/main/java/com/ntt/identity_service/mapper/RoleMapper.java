package com.ntt.identity_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.ntt.identity_service.dto.request.RoleRequest;
import com.ntt.identity_service.dto.request.UserUpdateRequest;
import com.ntt.identity_service.dto.response.RoleResponse;
import com.ntt.identity_service.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);

    void updateRole(@MappingTarget Role role, UserUpdateRequest request);
}
