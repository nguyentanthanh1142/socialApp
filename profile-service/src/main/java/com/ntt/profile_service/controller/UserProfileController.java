package com.ntt.profile_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.profile_service.dto.request.OnboardingRequest;
import com.ntt.profile_service.dto.request.SearchUserRequest;
import com.ntt.profile_service.dto.request.UpdateProfileRequest;
import com.ntt.profile_service.dto.response.UserProfileResponse;
import com.ntt.profile_service.service.UserProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;
    private final RestClient.Builder builder;


    @GetMapping("/my-profile")
    ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getMyProfile())
                .build();
    }

    @PutMapping("/my-profile")
    ApiResponse<UserProfileResponse> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateMyProfile(request))
                .build();
    }
    @PutMapping("/avatar")
    ApiResponse<UserProfileResponse> updateAvatar(@RequestParam MultipartFile[] file) throws IOException {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateAvatar(file))
                .build();
    }

    @GetMapping("/popular")
    ApiResponse<List<UserProfileResponse>> getPopularProfiles() {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getPopularProfiles())
                .build();
    }
    @GetMapping("/{username}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String username) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getProfilesByUsername(username))
                .build();
    }

    @PutMapping("/onboarding")
    ApiResponse<UserProfileResponse> completeOnboarding(@Valid @RequestBody OnboardingRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.completeOnboarding(request))
                .build();
    }

    @GetMapping("/users")
    List<UserProfileResponse> getAllProfiles()
    {
        return userProfileService.getAllProfiles();
    }
    @PostMapping("/users/search")
    ApiResponse<List<UserProfileResponse>> search(@RequestBody SearchUserRequest request) {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.search(request))
                .build();
    }
}
