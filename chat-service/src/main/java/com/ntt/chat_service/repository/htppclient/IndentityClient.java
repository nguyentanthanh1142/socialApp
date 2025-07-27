package com.ntt.chat_service.repository.htppclient;

import com.ntt.chat_service.dto.repuest.IntrospectRequest;
import com.ntt.chat_service.dto.response.IntrospectResponse;
import com.ntt.common_lib.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "identity-client", url = "${app.services.identity.url}")
public interface IndentityClient {

    @PostMapping("/auth/introspect")
    ApiResponse<IntrospectResponse> authenticationResponseApiResponse(@RequestBody IntrospectRequest request);
}
