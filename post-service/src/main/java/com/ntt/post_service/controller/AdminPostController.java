package com.ntt.post_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.post_service.dto.PageResponse;
import com.ntt.post_service.dto.response.PostResponse;
import com.ntt.post_service.dto.response.PostStatsResponse;
import com.ntt.post_service.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/admin/posts")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminPostController {
    PostService postService;

    @GetMapping
    ApiResponse<PageResponse<PostResponse>> getPosts(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "includeDeleted", defaultValue = "true") boolean includeDeleted) {
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getPostsForAdmin(page, size, includeDeleted))
                .build();
    }

    @GetMapping("/stats")
    ApiResponse<PostStatsResponse> getStats() {
        return ApiResponse.<PostStatsResponse>builder()
                .result(postService.getPostStats())
                .build();
    }

    @DeleteMapping("/{postId}")
    ApiResponse<PostResponse> softDeletePost(@PathVariable String postId) {
        return ApiResponse.<PostResponse>builder()
                .result(postService.softDeletePost(postId))
                .build();
    }
}
