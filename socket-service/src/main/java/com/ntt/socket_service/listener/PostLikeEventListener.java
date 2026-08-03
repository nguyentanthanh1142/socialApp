package com.ntt.socket_service.listener;

import com.ntt.common_lib.event.DomainNotificationEvent;
import com.ntt.socket_service.service.NotificationSocketService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostLikeEventListener {

    NotificationSocketService notificationSocketService;


//    @KafkaListener(topics = "notification-created", groupId = "chat-service")
//    public void handlePostLikeEvent(DomainNotificationEvent event) {
//        log.info("Received post-liked event: {}", event);
//        try {
//            notificationSocketService.sendNotification(event);
//        } catch (Exception e) {
//            log.error("Error handling post-liked event", e);
//        }
//    }


}
