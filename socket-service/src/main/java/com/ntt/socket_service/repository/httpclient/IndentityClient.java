package com.ntt.socket_service.repository.httpclient;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.socket_service.dto.request.IntrospectRequest;
import com.ntt.socket_service.dto.response.IntrospectResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "identity-client", url = "${app.services.identity.url}")
public interface IndentityClient {

    @PostMapping("/auth/introspect")
    ApiResponse<IntrospectResponse> authenticationResponseApiResponse(@RequestBody IntrospectRequest request);
}
