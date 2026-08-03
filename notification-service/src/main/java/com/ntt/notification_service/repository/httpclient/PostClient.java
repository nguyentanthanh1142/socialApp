package com.ntt.notification_service.repository.httpclient;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.notification_service.configuration.AuthenticationRequestInterceptor;
import com.ntt.notification_service.dto.response.PostResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "post-service", url = "${app.services.post.url}", configuration = AuthenticationRequestInterceptor.class)
public interface PostClient {

    @GetMapping("/{postId}")
    ApiResponse<PostResponse> getPost(@PathVariable String postId);
}
