package com.ntt.identity_service.service;

import java.util.HashSet;
import java.util.List;

import com.ntt.event.dto.NotificationEvent;
import com.ntt.identity_service.constant.PredefindRole;
import com.ntt.identity_service.entity.Role;
import com.ntt.identity_service.mapper.ProfileMapper;
import com.ntt.identity_service.repository.httpClient.ProfileClient;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ntt.identity_service.dto.request.UserCreationRequest;
import com.ntt.identity_service.dto.request.UserUpdateRequest;
import com.ntt.identity_service.dto.response.UserResponse;
import com.ntt.identity_service.entity.User;
import com.ntt.identity_service.exception.AppException;
import com.ntt.identity_service.exception.ErrorCode;
import com.ntt.identity_service.mapper.UserMapper;
import com.ntt.identity_service.repository.RoleRepository;
import com.ntt.identity_service.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    ProfileMapper profileMapper;
    PasswordEncoder passwordEncoder;
    ProfileClient profileClient;
    KafkaTemplate<String, Object> kafkaTemplate;

    public UserResponse createUser(UserCreationRequest request) {
        if(userRepository.existsByUsername(request.getUsername())) throw new AppException(ErrorCode.USER_EXISTED);


        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefindRole.USER).ifPresent(roles::add);
        user.setRoles(roles);

        try{
            user = userRepository.save(user);
            var profileRequest = profileMapper.toProfileCreationRequest(request);
            profileRequest.setUserId(user.getId());
            var profileResponse = profileClient.createProfile(profileRequest );
            log.info(profileResponse.toString());
        } catch( DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        NotificationEvent notificationEvent = NotificationEvent.builder()
                .chanel("")
                .recipient("")
                .subject("")
                .body("Hello, " + user.getUsername() + "!")
                .build();
        kafkaTemplate.send("notification-delivery",notificationEvent);
        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        log.info("In method getUsers");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse getUserById(String userId) {
        log.info("In method get user by id");
        return userMapper.toUserResponse(
                userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found")));
    }

    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        context.getAuthentication().getName();
        String username = context.getAuthentication().getName();

        User user =
                userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    public void createPassword(UserCreationRequest request) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if(StringUtils.hasText(user.getPassword())){
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }
}
