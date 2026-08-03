package com.ntt.feed_service.repository.httpClient;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.feed_service.dto.response.PostResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "post-service", url = "${app.services.post.url}")
public interface PostClient {

    @GetMapping("/{postId}")
    ApiResponse<PostResponse> getPost(@PathVariable String postId);
}
