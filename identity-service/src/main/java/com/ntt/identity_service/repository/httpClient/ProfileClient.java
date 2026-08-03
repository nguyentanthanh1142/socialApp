package com.ntt.identity_service.repository.httpClient;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.identity_service.configuration.AuthenticationRequestInterceptor;
import com.ntt.identity_service.dto.request.ProfileCreationRequest;
import com.ntt.identity_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "profile-service", url="${app.services.profile}",
        configuration = AuthenticationRequestInterceptor.class)
public interface ProfileClient {
    @PostMapping(value = "/internal/users",produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserProfileResponse> createProfile(@RequestBody ProfileCreationRequest request);
}
