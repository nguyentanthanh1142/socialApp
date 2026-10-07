package com.ntt.relation_service.mapper;

import com.ntt.relation_service.dto.request.RelationRequest;
import com.ntt.relation_service.dto.response.RelationResponse;
import com.ntt.relation_service.entity.Relation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RelationMapper {

    RelationResponse toRelationReponse(Relation relation);
    Relation toRelation(RelationRequest relationRequest);
}
