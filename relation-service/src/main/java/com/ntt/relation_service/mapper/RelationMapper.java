package com.ntt.relation_service.mapper;

import com.ntt.relation_service.dto.request.RelationRequest;
import com.ntt.relation_service.dto.response.RelationReponse;
import com.ntt.relation_service.entity.Relation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RelationMapper {

    RelationReponse toRelationReponse(Relation relation);
    Relation toRelation(RelationRequest relationRequest);
}
