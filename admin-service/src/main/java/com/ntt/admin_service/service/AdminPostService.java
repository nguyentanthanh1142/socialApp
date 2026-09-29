package com.ntt.admin_service.service;

import com.ntt.admin_service.aspect.Audited;
import com.ntt.admin_service.dto.response.AdminPostResponse;
import com.ntt.admin_service.dto.response.PostStatsResponse;
import com.ntt.admin_service.exception.AppException;
import com.ntt.admin_service.exception.ErrorCode;
import com.ntt.admin_service.exception.ResourceNotFoundException;
import com.ntt.admin_service.repository.httpclient.PostClient;
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
public class AdminPostService {

    PostClient postClient;

    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<AdminPostResponse> getPosts(int page, int size, boolean includeDeleted) {
        try {
            return postClient.getPosts(page, size, includeDeleted).getResult();
        } catch (FeignException e) {
            log.error("Failed to fetch posts from post-service: {}", e.getMessage());
            throw new AppException(ErrorCode.REMOTE_SERVICE_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PostStatsResponse getPostStats() {
        try {
            return postClient.getPostStats().getResult();
        } catch (FeignException e) {
            log.error("Failed to fetch post stats: {}", e.getMessage());
            throw new AppException(ErrorCode.REMOTE_SERVICE_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Audited(action = "SOFT_DELETE_POST", targetType = "POST", targetId = "#postId")
    public AdminPostResponse softDeletePost(String postId) {
        try {
            ApiResponse<AdminPostResponse> response = postClient.softDeletePost(postId);
            if (response.getResult() == null) {
                throw new ResourceNotFoundException("Post", postId);
            }
            return response.getResult();
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("Post", postId);
        } catch (FeignException e) {
            log.error("Failed to soft-delete post {}: {}", postId, e.getMessage());
            throw new AppException(ErrorCode.REMOTE_SERVICE_ERROR, e.getMessage());
        }
    }
}
