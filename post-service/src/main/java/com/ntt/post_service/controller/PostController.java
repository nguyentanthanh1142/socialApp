package com.ntt.post_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.post_service.dto.PageResponse;
import com.ntt.post_service.dto.request.PostRequest;
import com.ntt.post_service.dto.response.PostLikeResponse;
import com.ntt.post_service.dto.response.PostResponse;
import com.ntt.post_service.service.LikeService;
import com.ntt.post_service.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostController {
    PostService postService;
    LikeService likeService;

    @PostMapping("/create")
        ApiResponse<PostResponse> createPost(@RequestParam("content") String content, @RequestParam(value = "files", required = false)MultipartFile[] files) {
           PostRequest postRequest = new PostRequest();
            postRequest.setContent(content);
            postRequest.setFiles(files);
            return ApiResponse.<PostResponse>builder()
                    .result(postService.createPost(postRequest))
                    .build();
    }
    @GetMapping("/my-posts")
    ApiResponse<PageResponse<PostResponse>> getMyPosts(
            @RequestParam(value = "page",required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
            ) {
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getMyPosts(page,size))
                .build();
    }
    @PostMapping("/{postId}/like")
    ApiResponse<PostLikeResponse> likePost(@PathVariable String postId )
    {
        return ApiResponse.<PostLikeResponse>builder()
                .result(PostLikeResponse.builder()
                        .postId(postId)
                        .liked(likeService.toggleLikes(postId))
                        .likeCount(likeService.getLikeCount(postId))
                        .build())
                .build();
    }
    @GetMapping("/{postId}")
    ApiResponse<PostResponse> getPost(@PathVariable String postId)
    {
        return ApiResponse.<PostResponse>builder()
                .result(postService.getPost(postId))
                .build();
    }
}
