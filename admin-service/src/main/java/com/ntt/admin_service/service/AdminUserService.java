package com.ntt.admin_service.service;

import com.ntt.admin_service.aspect.Audited;
import com.ntt.admin_service.dto.request.UserStatusUpdateRequest;
import com.ntt.admin_service.dto.response.AdminUserResponse;
import com.ntt.admin_service.dto.response.UserStatsResponse;
import com.ntt.admin_service.exception.AppException;
import com.ntt.admin_service.exception.ErrorCode;
import com.ntt.admin_service.exception.ResourceNotFoundException;
import com.ntt.admin_service.repository.httpclient.IdentityClient;
import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.PageResponse;

import feign.FeignException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminUserService {

    IdentityClient identityClient;

    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<AdminUserResponse> getUsers(int page, int size) {
        try {
            ApiResponse<PageResponse<AdminUserResponse>> response = identityClient.getUsers(page, size);
            return response.getResult();
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("User", "page");
        } catch (FeignException e) {
            log.error("Failed to fetch users from identity-service: {}", e.getMessage());
            throw new AppException(ErrorCode.REMOTE_SERVICE_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserStatsResponse getUserStats() {
        try {
            return identityClient.getUserStats().getResult();
        } catch (FeignException e) {
            log.error("Failed to fetch user stats: {}", e.getMessage());
            throw new AppException(ErrorCode.REMOTE_SERVICE_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse getUser(String userId) {
        try {
            AdminUserResponse user = identityClient.getUser(userId).getResult();
            if (user == null) {
                throw new ResourceNotFoundException("User", userId);
            }
            return user;
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("User", userId);
        } catch (FeignException e) {
            log.error("Failed to fetch user {}: {}", userId, e.getMessage());
            throw new AppException(ErrorCode.REMOTE_SERVICE_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Audited(action = "BAN_USER", targetType = "USER", targetId = "#userId")
    public AdminUserResponse banUser(String userId) {
        return updateStatus(userId, "BANNED");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Audited(action = "UNBAN_USER", targetType = "USER", targetId = "#userId")
    public AdminUserResponse unbanUser(String userId) {
        return updateStatus(userId, "ACTIVE");
    }

    private AdminUserResponse updateStatus(String userId, String status) {
        try {
            ApiResponse<AdminUserResponse> response =
                    identityClient.updateUserStatus(userId, UserStatusUpdateRequest.builder().status(status).build());
            if (response.getResult() == null) {
                throw new ResourceNotFoundException("User", userId);
            }
            return response.getResult();
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("User", userId);
        } catch (FeignException e) {
            log.error("Failed to update status for user {}: {}", userId, e.getMessage());
            throw new AppException(ErrorCode.REMOTE_SERVICE_ERROR, e.getMessage());
        }
    }
}
