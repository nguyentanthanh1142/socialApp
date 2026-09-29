package com.ntt.identity_service.service;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;

import com.ntt.identity_service.dto.request.UserCreationRequest;
import com.ntt.identity_service.entity.User;
import com.ntt.identity_service.exception.AppException;
import com.ntt.identity_service.repository.UserRepository;

@SpringBootTest
@TestPropertySource("/test.properties")
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    private UserCreationRequest request;
    private User user;

    @BeforeEach
    void initData() {
        request = UserCreationRequest.builder()
                .username("daylaclone2")
                .password("daylaclone1")
                .email("daylaclone2@example.com")
                .build();

        user = User.builder()
                .id("cf3034564871")
                .username("daylaclone2")
                .email("daylaclone2@example.com")
                .build();
    }

    @Test
    void createUser_validRequest_success() throws Exception {
        Mockito.when(userRepository.existsByUsername(anyString())).thenReturn(false);
        Mockito.when(userRepository.save(any())).thenReturn(user);

        var response = userService.createUser(request);

        assertThat(response.getId()).isEqualTo("cf3034564871");
        assertThat(response.getUsername()).isEqualTo("daylaclone2");
    }

    @Test
    void createUser_userExisted_fail() throws Exception {
        Mockito.when(userRepository.existsByUsername(anyString())).thenReturn(true);

        var exception = assertThrows(AppException.class, () -> userService.createUser(request));

        Assertions.assertEquals(1002, exception.getErrorCode().getCode());
    }

    @Test
    @WithMockUser(username = "daylaclone2")
    void getMyInfo_valid_success() throws Exception {
        Mockito.when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));

        var response = userService.getMyInfo();

        Assertions.assertEquals(response.getUsername(), "daylaclone2");
        Assertions.assertEquals(response.getId(), "cf3034564871");
    }

    @Test
    @WithMockUser(username = "daylaclone2")
    void getMyInfo_indValid_fail() throws Exception {
        Mockito.when(userRepository.findByUsername(anyString())).thenReturn(Optional.ofNullable(null));

        var exception = assertThrows(AppException.class, () -> userService.getMyInfo());

        Assertions.assertEquals(1005, exception.getErrorCode().getCode());
    }
}