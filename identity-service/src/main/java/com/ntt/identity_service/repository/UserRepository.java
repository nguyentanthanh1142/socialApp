package com.ntt.identity_service.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ntt.identity_service.entity.User;
import com.ntt.identity_service.enums.UserStatus;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :loginIdentifier OR u.email = :loginIdentifier")
    Optional<User> findByUsernameOrEmail(@Param("loginIdentifier") String loginIdentifier);

    Page<User> findAllByOrderByUsernameAsc(Pageable pageable);

    long countByStatus(UserStatus status);
}
