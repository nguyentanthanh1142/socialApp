package com.ntt.profile_service.mapper;

import com.ntt.profile_service.dto.response.PublicUserProfileResponse;
import com.ntt.profile_service.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)  public interface PublicUserProfileMapper {

    @Mapping(target = "isFollowing", ignore = true)
    @Mapping(target = "isSelf", ignore = true)
    PublicUserProfileResponse toPublicUserProfileResponse(UserProfile entity);
}
