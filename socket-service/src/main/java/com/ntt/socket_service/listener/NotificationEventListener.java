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
public class NotificationEventListener {

    NotificationSocketService notificationSocketService;
    @KafkaListener(
            topics = "notification-created",
            groupId = "notification-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleNotification(DomainNotificationEvent event) {
        log.info("📥 Received NotificationEvent: type={}, user={}, actor={}",
                event.getType(), event.getUserId(), event.getActorId());
        try {
            notificationSocketService.sendNotification(event);
        } catch (Exception e) {
            log.error("Failed to send notification via socket for event {}", event, e);
        }
    }
}
