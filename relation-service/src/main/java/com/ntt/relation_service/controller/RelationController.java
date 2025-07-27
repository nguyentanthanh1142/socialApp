package com.ntt.relation_service.controller;

import com.ntt.relation_service.dto.request.RelationRequest;
import com.ntt.relation_service.dto.response.ApiResponse;
import com.ntt.relation_service.dto.response.RelationReponse;
import com.ntt.relation_service.service.RelationService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RelationController {

    RelationService relationService;
    @PostMapping("/create")
    public ApiResponse<RelationReponse> createRelation(@RequestBody RelationRequest relation) {

        return ApiResponse.<RelationReponse>builder()
                .result(relationService.createRelation(relation))
                .build();
    }

}
