package com.ntt.identity_service.service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;

import com.ntt.common_lib.dto.PageResponse;
import com.ntt.identity_service.constant.PredefindRole;
import com.ntt.identity_service.dto.request.UserCreationRequest;
import com.ntt.identity_service.dto.request.UserStatusUpdateRequest;
import com.ntt.identity_service.dto.request.UserUpdateRequest;
import com.ntt.identity_service.dto.response.UserResponse;
import com.ntt.identity_service.dto.response.UserStatsResponse;
import com.ntt.identity_service.entity.Role;
import com.ntt.identity_service.entity.User;
import com.ntt.identity_service.enums.UserStatus;
import com.ntt.identity_service.exception.AppException;
import com.ntt.identity_service.exception.ErrorCode;
import com.ntt.identity_service.mapper.UserMapper;
import com.ntt.identity_service.repository.RoleRepository;
import com.ntt.identity_service.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${app.verify.url}")
    protected String verifyEmailUrl;

    public User createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefindRole.USER).ifPresent(roles::add);
        user.setRoles(roles);
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        user.setFirstLogin(true);
        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        return user;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        log.info("In method getUsers");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<UserResponse> getUsersPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size);
        var pageData = userRepository.findAllByOrderByUsernameAsc(pageable);
        return PageResponse.<UserResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .hasNext(pageData.hasNext())
                .data(pageData.stream().map(userMapper::toUserResponse).toList())
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserStatsResponse getUserStats() {
        long total = userRepository.count();
        long banned = userRepository.countByStatus(UserStatus.BANNED);
        return UserStatsResponse.builder()
                .totalUsers(total)
                .bannedUsers(banned)
                .activeUsers(total - banned)
                .build();
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse getUserById(String userId) {
        log.info("In method get user by id");
        return userMapper.toUserResponse(
                userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUserByIdForAdmin(String userId) {
        return userMapper.toUserResponse(
                userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserResponse updateUserStatus(String userId, UserStatusUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        UserStatus newStatus = request.getStatus();

        if (user.getStatus() == newStatus) {
            throw new AppException(ErrorCode.USER_STATUS_UNCHANGED);
        }

        user.setStatus(newStatus);
        user.setStatusUpdatedAt(Instant.now());
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        userRepository.deleteById(userId);
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findById(username)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
        return userMapper.toUserResponse(user);
    }

    public void createPassword(UserCreationRequest request) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (StringUtils.hasText(user.getPassword())) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void completeOnboarding() {
        String name = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findById(name)
                .orElseGet(() -> userRepository.findByUsername(name)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));

        user.setFirstLogin(false);
        userRepository.save(user);
        log.info("Successfully updated isFirstLogin = false for user: {}", user.getId());
    }
}