package com.ntt.admin_service.controller;

import com.ntt.admin_service.dto.response.AdminPostResponse;
import com.ntt.admin_service.service.AdminPostService;
import com.ntt.common_lib.dto.PageResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminPostController {

    AdminPostService adminPostService;

    @GetMapping
    public ResponseEntity<?> getPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminPostResponse> posts = adminPostService.getPosts(page, size, true);
        return ResponseEntity.ok(posts);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> softDeletePost(@PathVariable String postId) {
        adminPostService.softDeletePost(postId);
        return ResponseEntity.ok("Post soft-deleted successfully");
    }
}
