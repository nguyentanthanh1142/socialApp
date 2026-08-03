package com.ntt.notification_service.listener;

import com.ntt.common_lib.event.DomainNotificationEvent;
import com.ntt.event.dto.NotificationEvent;
import com.ntt.notification_service.dto.Recipient;
import com.ntt.notification_service.dto.SendEmailRequest;
import com.ntt.notification_service.service.EmailService;
import com.ntt.notification_service.service.NotificationService;
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
    EmailService emailService;
    NotificationService notificationService;

    @KafkaListener(topics="notification-delivery")
    public void listenNotification(NotificationEvent message){
        log.info("Message received: {}", message);
        emailService.sendEmail(SendEmailRequest.builder()
                .to(Recipient.builder()
                        .email(message.getRecipient())
                        .build())
                .subject(message.getSubject())
                .params(message.getParams())
                .templateCode(message.getTemplateCode())
                .htmlContent(message.getBody())
                .build());
    }

    @KafkaListener(topics = "post-liked")
    public void listenPostLiked(DomainNotificationEvent event){
        log.info("PostLiked event received: {}", event);
        notificationService.handlePostLikedEvent(event);
    }

    @KafkaListener(topics = "post-commented")
    public void listenComment(DomainNotificationEvent event) {
        log.info("Comment event received: {}", event);
        notificationService.handleCommentEvent(event);
    }
}
