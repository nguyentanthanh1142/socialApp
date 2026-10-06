package com.ntt.relation_service.repository;

import com.ntt.relation_service.entity.Relation;
import com.ntt.relation_service.enums.RelationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RelationRepository extends MongoRepository<Relation, String> {
    Optional<Relation> findByParticipantsHash(String hash);

    @Query("{'participants.userId' : ?0}")
    List<Relation> findAllByParticipantIdsContains(String userId);

    @Query("{'participants.userId' : ?0, 'status' : ?1}")
    List<Relation> findAllByParticipantIdsContainsAndStatus(String userId, RelationStatus status);

    @Query("{'participants.userId' : ?0, 'status' : ?1}")
    Page<Relation> findAllByParticipantIdsContainsAndStatus(String userId, RelationStatus status, Pageable pageable);

    @Query("{'participants.userId' : { $in: ?0 }, 'status' : ?1}")
    List<Relation> findAllByParticipantIdsInAndStatus(Collection<String> userIds, RelationStatus status);
}
