package com.ntt.relation_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.relation_service.dto.request.RelationRequest;
import com.ntt.relation_service.dto.response.RelationReponse;
import com.ntt.relation_service.dto.response.SuggestionResponse;
import com.ntt.relation_service.enums.RelationStatus;
import com.ntt.relation_service.service.RelationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RelationController {
    RelationService relationService;
    @PostMapping("/pending")
    public ApiResponse<RelationReponse> sendFriendRequest(@RequestBody RelationRequest relation) {
        return ApiResponse.<RelationReponse>builder()
                .result(relationService.createRelation(relation, RelationStatus.PENDING))
                .build();
    }
    @PutMapping("/accept/{relationId}")
    public ApiResponse<RelationReponse> acceptFriend(@PathVariable String relationId) {
        return ApiResponse.<RelationReponse>builder()
                .result(relationService.updateRelationStatus(relationId, RelationStatus.ACCEPTED))
                .build();
    }
    @PutMapping("/block")
    public ApiResponse<RelationReponse> blockUser(@PathVariable String relationId) {
        return ApiResponse.<RelationReponse>builder()
                        .result(relationService.updateRelationStatus(relationId, RelationStatus.BLOCKED))
                .build();
    }
    @PutMapping("/refuse/{relationId}")
    public ApiResponse<RelationReponse> refuseFriend(@PathVariable String relationId) {
        return ApiResponse.<RelationReponse>builder()
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
    public ApiResponse<List<RelationReponse>> getMyFriendList() {
        return ApiResponse.<List<RelationReponse>>builder()
                .result(relationService.getMyFriendList())
                .build();
    }
    @GetMapping("/my-friend-requests")
    public ApiResponse<List<RelationReponse>> getMyFriendRequests() {
        return ApiResponse.<List<RelationReponse>>builder()
                .result(relationService.getMyFriendRequests())
                .build();
    }
    @GetMapping("/followers/{userId}")
    public ApiResponse<List<String>> getFollowers(@PathVariable String userId) {
        return ApiResponse.<List<String>>builder()
                .result(relationService.getFollowers(userId))
                .build();
    }
}
