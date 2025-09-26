package com.ntt.profile_service.repository;


import com.ntt.profile_service.entity.UserProfile;
import org.springframework.data.domain.Limit;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserProfileRespository extends Neo4jRepository<UserProfile, String> {
    Optional<UserProfile> findByUserId(String userId);
    Optional<UserProfile> findByUsername(String username);
    List<UserProfile> findAllByUsernameLike(String username);

    List<UserProfile> findTop20ByCity(String city);
}
