package com.ntt.relation_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.relation_service.dto.response.RelationStatusResponse;
import com.ntt.relation_service.service.RelationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalRelationController {

    RelationService relationService;


    @GetMapping("/internal/relation")
    public ApiResponse<RelationStatusResponse> getRelationshipStatus(
            @RequestParam("viewerId") String viewerId,
            @RequestParam("targetId") String targetId) {

        return ApiResponse.<RelationStatusResponse>builder()
                .result(relationService.getRelationshipStatus(viewerId, targetId))
                .build();
    }
}
