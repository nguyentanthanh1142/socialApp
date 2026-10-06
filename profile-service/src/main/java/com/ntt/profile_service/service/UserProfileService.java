package com.ntt.profile_service.service;

import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.dto.UserProfileDTO;
import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.common_lib.event.chat.UserAvatarUpdatedEvent;
import com.ntt.profile_service.cache.UserProfileCacheImpl;
import com.ntt.profile_service.dto.request.*;
import com.ntt.profile_service.dto.response.PublicUserProfileResponse;
import com.ntt.profile_service.dto.response.UserProfileResponse;
import com.ntt.profile_service.entity.UserProfile;
import com.ntt.profile_service.exception.AppException;
import com.ntt.profile_service.exception.ErrorCode;
import com.ntt.profile_service.mapper.PublicUserProfileMapper;
import com.ntt.profile_service.mapper.UserProfileMapper;
import com.ntt.profile_service.repository.UserProfileRespository;
import com.ntt.profile_service.repository.httpclient.FileClient;
import com.ntt.profile_service.repository.httpclient.IdentityClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.neo4j.driver.exceptions.NoSuchRecordException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
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
    PublicUserProfileMapper publicUserProfileMapper;
    UserProfileMapper userProfileMapper;
    FileClient fileClient;
    UserProfileCacheImpl userProfileCache;
    KafkaTemplate<String, Object> kafkaTemplate;
    IdentityClient identityClient;
    TransactionTemplate transactionTemplate;



    @Transactional
    public UserProfileResponse createProfile(ProfileCreationRequest request) {
        UserProfile userProfile = userProfileMapper.toUserProfile(request);
        userProfile = userProfileRepository.save(userProfile);

        syncUserProfileToCache(userProfile);
        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public UserProfileResponse getMyProfile() {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("User ID: {}", userId);
        try {
            UserProfile userProfile = userProfileRepository.findByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
            return userProfileMapper.toUserProfileResponse(userProfile);
        } catch (NoSuchRecordException e) {
            throw new AppException(ErrorCode.PROFILE_NOT_FOUND);
        }
    }

    @Transactional
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        String userId = getCurrentUserId();

        var userProfile = userProfileRepository.findByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        userProfileMapper.update(userProfile, request);
        userProfile = userProfileRepository.save(userProfile);

        syncUserProfileToCache(userProfile);
        return userProfileMapper.toUserProfileResponse(userProfileRepository.save(userProfile));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getByUserId(String userId) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllProfiles() {
        List<UserProfile> userProfiles = userProfileRepository.findAll();
        return userProfiles.stream().map(userProfileMapper::toUserProfileResponse).collect(Collectors.toList());
    }

    public UserProfileResponse updateAvatar(MultipartFile[] file) throws IOException {

        if (file == null || file.length == 0 || file[0].isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        String userId = getCurrentUserId();

        // 1. Call External Upload (NẰM NGOÀI TRANSACTION)
        var response = fileClient.uploadMedia(file, FileOwnerType.AVATAR,userId);
        if (response == null || response.getResult() == null || response.getResult().isEmpty()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        FileResponse uploadedFile = response.getResult().getFirst();
        String avatarUrl = uploadedFile.getUrl();
        String fileId = uploadedFile.getFileId();

        try {
            UserProfile userProfile = transactionTemplate.execute(status -> {
                UserProfile profile = userProfileRepository.findByUserId(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
                profile.setAvatarUrl(avatarUrl);
                return userProfileRepository.save(profile);
            });

            // 3. Sync Cache & Send Event (NẰM NGOÀI TRANSACTION)
            syncUserProfileToCache(userProfile);

            UserAvatarUpdatedEvent event = UserAvatarUpdatedEvent.builder()
                    .userId(userId)
                    .name(userProfile.getUsername())
                    .avatarUrl(avatarUrl)
                    .updatedAt(java.time.Instant.now())
                    .build();

            kafkaTemplate.send("user-avatar-updated-topic", event);

            return userProfileMapper.toUserProfileResponse(userProfile);

        } catch (Exception e) {
            log.error("Failed to save profile or send event, rolling back file: {}", fileId, e);
            try {
                fileClient.deleteFile(fileId);
            } catch (Exception deleteEx) {
                log.error("Failed to cleanup file: {}", fileId, deleteEx);
            }
            throw e;
        }
    }

    @Transactional
    public UserProfile saveAvatarToDb(String userId, String avatarUrl) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        userProfile.setAvatarUrl(avatarUrl);
        return userProfileRepository.save(userProfile);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> search(SearchUserRequest request) {
        String userId = getCurrentUserId();
        List<UserProfile> userProfiles = userProfileRepository.findAllByUsernameLike(request.getKeyword());
        return userProfiles.stream().filter(userProfile -> !userProfile.getUserId().equals(userId)).map(userProfileMapper::toUserProfileResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getPopularProfiles() {
        String userId = getCurrentUserId();
        UserProfile myProfile = userProfileRepository.findByUserId(userId).orElse(null);

        List<UserProfile> popularUsers;
        if (myProfile != null && myProfile.getCurrentCity() != null && !myProfile.getCurrentCity().trim().isEmpty()) {
            popularUsers = userProfileRepository.findTop20ByCurrentCity(myProfile.getCurrentCity());
        } else {
            popularUsers = userProfileRepository.findAll();
        }

        return popularUsers.stream().filter(profile -> profile != null && !profile.getUserId().equals(userId)).map(userProfileMapper::toUserProfileResponse).limit(20).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getProfilesByIds(List<String> userIds) {
        List<UserProfile> userProfiles = userProfileRepository.findAllById(userIds);
        return userProfiles.stream().map(userProfileMapper::toUserProfileResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfilesByUsername(String username) {
        UserProfile userProfile = userProfileRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    @Transactional(readOnly = true)
    public PublicUserProfileResponse getPublicProfileByUsername(String username) {
        UserProfile userProfile = userProfileRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        var response = publicUserProfileMapper.toPublicUserProfileResponse(userProfile);

        String userId = getCurrentUserId();

        if (userId != null) {
            response.setIsSelf(userId.equals(userProfile.getUserId()));


        } else {
            response.setIsSelf(false);
            response.setIsFollowing(false);
        }
        
        return response;
    }

    @Transactional
    public UserProfileResponse completeOnboarding(OnboardingRequest request) {
        String userId = getCurrentUserId();

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("Profile not found for userId: {}. Creating new profile for onboarding.", userId);
                    return UserProfile.builder()
                            .userId(userId)
                            .build();
                });

        userProfileMapper.updateFromOnboarding(userProfile, request);
        userProfile = userProfileRepository.save(userProfile);

        syncUserProfileToCache(userProfile);

        log.info("Calling identity-service to complete onboarding for userId: {}", userId);
        try {
            var response = identityClient.completeOnboarding();
            log.info("Identity-service onboarding response: {}", response);
        } catch (Exception e) {
            log.error("Failed to call identity-service completeOnboarding", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    private void syncUserProfileToCache(UserProfile userProfile) {
        UserProfileDTO cacheDto = UserProfileDTO.builder()
                .userId(userProfile.getUserId())
                .name(userProfile.getUsername())
                .firstName(userProfile.getFirstName())
                .lastName(userProfile.getLastName())
                .avatarUrl(userProfile.getAvatarUrl())
                .build();

        userProfileCache.putUserProfile(cacheDto);
        log.info("Updated Redis cache for userId: {}", userProfile.getUserId());
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
