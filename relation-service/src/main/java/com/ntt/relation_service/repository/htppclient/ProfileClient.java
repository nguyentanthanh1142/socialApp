package com.ntt.relation_service.repository.htppclient;



import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.relation_service.configuration.AuthenticationRequestInterceptor;
import com.ntt.relation_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "profile-service", url = "${app.services.profile.url}",configuration = AuthenticationRequestInterceptor.class)
public interface ProfileClient {
    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId);
    @GetMapping("/users/popular")
    ApiResponse<List<UserProfileResponse>> getPopularProfiles();
    @PostMapping("/users/profiles")
    ApiResponse<List<UserProfileResponse>> getProfiles(@RequestBody List<String> request);
}
