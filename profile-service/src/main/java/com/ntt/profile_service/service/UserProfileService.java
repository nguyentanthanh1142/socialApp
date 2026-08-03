package com.ntt.profile_service.service;

import com.ntt.common_lib.dto.UserProfileDTO;
import com.ntt.profile_service.cache.UserProfileCacheImpl;
import com.ntt.profile_service.dto.request.ProfileCreationRequest;
import com.ntt.profile_service.dto.request.SearchUserRequest;
import com.ntt.profile_service.dto.request.UpdateProfileRequest;
import com.ntt.profile_service.dto.response.UserProfileResponse;
import com.ntt.profile_service.entity.UserProfile;
import com.ntt.profile_service.exception.AppException;
import com.ntt.profile_service.exception.ErrorCode;
import com.ntt.profile_service.mapper.UserProfileMapper;
import com.ntt.profile_service.repository.UserProfileRespository;
import com.ntt.profile_service.repository.httpclient.FileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.neo4j.driver.exceptions.NoSuchRecordException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserProfileService {
    UserProfileRespository userProfileRepository;
    UserProfileMapper userProfileMapper;
    FileClient fileClient;
    UserProfileCacheImpl userProfileCache;

    public UserProfileResponse createProfile(ProfileCreationRequest request) {
        UserProfile userProfile = userProfileMapper.toUserProfile(request);
        userProfile = userProfileRepository.save(userProfile);
        userProfileCache.putUserProfile(UserProfileDTO.builder()
                .avatarUrl(userProfile.getAvatar())
                .name(userProfile.getUsername())
                .userId(userProfile.getUserId())
                .firstName(userProfile.getFirstname())
                .lastName(userProfile.getLastname())
                .build());
        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public UserProfileResponse getMyProfile() {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("User ID: {}", userId);
        try {
            UserProfile userProfile = userProfileRepository.findByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            return userProfileMapper.toUserProfileResponse(userProfile);
        } catch (NoSuchRecordException e) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        var ahuentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = ahuentication.getName();

        var userProfile = userProfileRepository.findByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userProfileMapper.update(userProfile, request);
        userProfileCache.putUserProfile(UserProfileDTO.builder()
                .avatarUrl(userProfile.getAvatar())
                .name(userProfile.getUsername())
                .userId(userProfile.getUserId())
                .firstName(userProfile.getFirstname())
                .lastName(userProfile.getLastname())
                .build());
        return userProfileMapper.toUserProfileResponse(userProfileRepository.save(userProfile));
    }

    public UserProfileResponse getProfile(String userId) {
        UserProfile userProfile =
                userProfileRepository.findByUserId(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public UserProfileResponse getByUserId(String userId) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileResponse> getAllProfiles() {
        List<UserProfile> userProfiles = userProfileRepository.findAll();
        return userProfiles.stream().map(userProfileMapper::toUserProfileResponse).collect(Collectors.toList());
    }

    public UserProfileResponse updateAvatar(MultipartFile[] file) throws IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        log.info(userId);
        var userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var response = fileClient.uploadMediaAvatar(file);
        userProfile.setAvatar(response.getResult().getFirst().getUrl());
        return userProfileMapper.toUserProfileResponse(userProfileRepository.save(userProfile));
    }

    public List<UserProfileResponse> search(SearchUserRequest request) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<UserProfile> userProfiles = userProfileRepository.findAllByUsernameLike(request.getKeyword());
        return userProfiles
                .stream()
                .filter(userProfile -> !userProfile.getUserId().equals(userId))
                .map(userProfileMapper::toUserProfileResponse).collect(Collectors.toList());
    }

    public List<UserProfileResponse> getPopularProfiles() {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfile myProfile = userProfileRepository.findByUserId(userId).orElse(null);

        List<UserProfile> popularUsers;
        if (myProfile != null && myProfile.getCity() != null && !myProfile.getCity().trim().isEmpty()) {
            popularUsers = userProfileRepository.findTop20ByCity(myProfile.getCity());
        } else {
            popularUsers = userProfileRepository.findAll();
        }

        return popularUsers.stream()
                .filter(profile -> profile != null && !profile.getUserId().equals(userId))
                .map(userProfileMapper::toUserProfileResponse)
                .limit(20)
                .collect(Collectors.toList());
    }

    public List<UserProfileResponse> getProfilesByIds(List<String> userIds) {
        List<UserProfile> userProfiles = userProfileRepository.findAllById(userIds);
        return userProfiles.stream().map(userProfileMapper::toUserProfileResponse).collect(Collectors.toList());
    }

    public UserProfileResponse getProfilesByUsername(String username) {
        UserProfile userProfile = userProfileRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userProfileMapper.toUserProfileResponse(userProfile);
    }
}
