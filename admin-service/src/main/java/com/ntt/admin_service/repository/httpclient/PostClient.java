package com.ntt.admin_service.repository.httpclient;

import com.ntt.admin_service.configuration.AuthenticationRequestInterceptor;
import com.ntt.admin_service.dto.response.AdminPostResponse;
import com.ntt.admin_service.dto.response.PostStatsResponse;
import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.PageResponse;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "post-service",
        url = "${app.services.post}",
        configuration = AuthenticationRequestInterceptor.class)
public interface PostClient {

    @GetMapping(value = "/internal/admin/posts", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PageResponse<AdminPostResponse>> getPosts(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("includeDeleted") boolean includeDeleted);

    @GetMapping(value = "/internal/admin/posts/stats", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PostStatsResponse> getPostStats();

    @DeleteMapping(value = "/internal/admin/posts/{postId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<AdminPostResponse> softDeletePost(@PathVariable("postId") String postId);
}
