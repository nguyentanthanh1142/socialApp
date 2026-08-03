package com.ntt.notification_service.repository.httpclient;

import com.ntt.common_lib.enums.NotificationType;
import com.ntt.notification_service.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<Notification,String> {

    boolean existsByPostIdAndUserIdAndActorIdAndType( String postId, String userId, String actorId, NotificationType type);

    List<Notification> findByUserIdAndReadFalse(String userId);

    Page<Notification> findAllByUserId(String userId, Pageable pageable);
}
