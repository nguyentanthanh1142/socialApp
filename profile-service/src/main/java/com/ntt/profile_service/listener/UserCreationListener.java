package com.ntt.profile_service.listener;

import com.ntt.common_lib.event.UserCreationEvent;
import com.ntt.profile_service.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserCreationListener {

    private final UserProfileService userProfileService;

    @KafkaListener(topics = "user-creation", groupId = "profile-service-group")
    public void handleUserCreationEvent(UserCreationEvent event) {
        log.info("Received UserCreationEvent for userId: {}", event.getUserId());

        userProfileService.createProfileFromEvent(event.getUserId(), event.getUsername());
    }
}
