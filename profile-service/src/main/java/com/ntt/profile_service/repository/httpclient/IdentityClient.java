package com.ntt.profile_service.repository.httpclient;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_web.InternalFeignConfiguration;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "identity-service", url = "${app.services.identity-service}",
        configuration = InternalFeignConfiguration.class)
public interface IdentityClient {
    @PutMapping("/users/me/complete-onboarding")
    ApiResponse<Void> completeOnboarding();
}
