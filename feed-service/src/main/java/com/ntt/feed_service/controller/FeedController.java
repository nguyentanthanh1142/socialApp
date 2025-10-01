package com.ntt.feed_service.controller;


import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.PageResponse;
import com.ntt.feed_service.dto.response.FeedResponse;
import com.ntt.feed_service.service.FeedService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedController {
    private static final String FEED_KEY_PREFIX = "feed:";
    private static final String POST_KEY_PREFIX = "post:";
    RedisTemplate<String, Object> redisTemplate;
    FeedService feedService;


    @GetMapping("/my-feed")
    ApiResponse<PageResponse<FeedResponse>> getMyFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.<PageResponse<FeedResponse>>builder()
                .result(feedService.getMyFeed(page,size))
                .build();
    }
    @GetMapping("/zzz")
    ApiResponse<List<String>> getMyFeed(){
        return ApiResponse.<List<String>>builder()
                .result(feedService.getMyFollowers())
                .build();
    }
    @PostMapping("/read")
    ApiResponse<Void> readFeed(@RequestBody List<String> postIds)
    {
        feedService.markRead(postIds);
        return ApiResponse.<Void>builder()
                .build();
    }
}

