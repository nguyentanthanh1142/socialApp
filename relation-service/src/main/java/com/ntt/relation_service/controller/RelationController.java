package com.ntt.relation_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.PageResponse;
import com.ntt.relation_service.dto.request.RelationRequest;
import com.ntt.relation_service.dto.response.RelationResponse;
import com.ntt.relation_service.dto.response.RelationStatusResponse;
import com.ntt.relation_service.dto.response.SuggestionResponse;
import com.ntt.relation_service.enums.RelationStatus;
import com.ntt.relation_service.service.RelationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RelationController {
    RelationService relationService;
    @PostMapping("/pending")
    public ApiResponse<RelationResponse> sendFriendRequest(@RequestBody RelationRequest relation) {
        return ApiResponse.<RelationResponse>builder()
                .result(relationService.createRelation(relation, RelationStatus.PENDING))
                .build();
    }
    @PutMapping("/accept/{relationId}")
    public ApiResponse<RelationResponse> acceptFriend(@PathVariable String relationId) {
        return ApiResponse.<RelationResponse>builder()
                .result(relationService.updateRelationStatus(relationId, RelationStatus.ACCEPTED))
                .build();
    }
    @PostMapping("/block/{targetUserId}")
    public ApiResponse<RelationResponse> blockUser(@PathVariable String targetUserId) {
        return ApiResponse.<RelationResponse>builder()
                .result(relationService.blockUser(targetUserId))
                .build();
    }

    @PostMapping("/unblock/{targetUserId}")
    public ApiResponse<String> unblockUser(@PathVariable String targetUserId) {
        relationService.unblockUser(targetUserId);
        return ApiResponse.<String>builder().result("Unblocked successfully").build();
    }

    @PostMapping("/unfriend/{targetUserId}")
    public ApiResponse<String> unfriendUser(@PathVariable String targetUserId) {
        relationService.unfriend(targetUserId);
        return ApiResponse.<String>builder().result("Unfriended successfully").build();
    }

    @PostMapping("/cancel/{targetUserId}")
    public ApiResponse<String> cancelFriendRequest(@PathVariable String targetUserId) {
        relationService.cancelRequest(targetUserId);
        return ApiResponse.<String>builder().result("Request cancelled successfully").build();
    }

    @GetMapping("/status/{targetUserId}")
    public ApiResponse<RelationStatusResponse> getRelationshipStatus(@PathVariable String targetUserId) {
        return ApiResponse.<RelationStatusResponse>builder()
                .result(relationService.getRelationshipStatusForCurrentUser(targetUserId))
                .build();
    }
    @PutMapping("/refuse/{relationId}")
    public ApiResponse<RelationResponse> refuseFriend(@PathVariable String relationId) {
        return ApiResponse.<RelationResponse>builder()
                .result(relationService.updateRelationStatus(relationId, RelationStatus.REJECTED))
                .build();
    }
    @GetMapping("/friends-suggestion")
    public ApiResponse<List<SuggestionResponse>> suggestFriends() {
        return ApiResponse.<List<SuggestionResponse>>builder()
                .result(relationService.listSuggestionFriends())
                .build();
    }
    @GetMapping("/my-friends")
    public ApiResponse<List<RelationResponse>> getMyFriendList() {
        return ApiResponse.<List<RelationResponse>>builder()
                .result(relationService.getMyFriendList())
                .build();
    }
    @GetMapping("/my-friend-requests")
    public ApiResponse<List<RelationResponse>> getMyFriendRequests() {
        return ApiResponse.<List<RelationResponse>>builder()
                .result(relationService.getMyFriendRequests())
                .build();
    }
    @GetMapping("/followers/{userId}")
    public ApiResponse<List<String>> getFollowers(@PathVariable String userId) {
        return ApiResponse.<List<String>>builder()
                .result(relationService.getFollowers(userId))
                .build();
    }
    @GetMapping("/contact")
    public ApiResponse<PageResponse<RelationResponse>> getContactRelation(Pageable pageable) {
        return ApiResponse.<PageResponse<RelationResponse>>builder()
                .result(relationService.getListContactRelation(pageable))
                .build();
    }
}
