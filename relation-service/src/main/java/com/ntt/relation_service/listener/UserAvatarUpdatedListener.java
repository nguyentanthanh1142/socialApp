package com.ntt.relation_service.listener;

import com.ntt.common_lib.event.chat.UserAvatarUpdatedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserAvatarUpdatedListener {

    private final MongoTemplate mongoTemplate;

    @KafkaListener(topics = "user-avatar-updated-topic", groupId = "relation-service-group")
    public void handleUserAvatarUpdatedEvent(UserAvatarUpdatedEvent event) {
        try {
            log.info("Received UserAvatarUpdatedEvent for userId: {}", event.getUserId());

            Query query = new Query(Criteria.where("participants.userId").is(event.getUserId()));
            Update update = new Update().set("participants.$.avatar", event.getAvatarUrl());

            mongoTemplate.updateMulti(query, update, "conversation");

            log.info("Updated avatar for userId: {} in all relevant conversations", event.getUserId());
        } catch (Exception e) {
            log.error("Error processing UserAvatarUpdatedEvent for userId: {}", event.getUserId(), e);
        }
    }
}
