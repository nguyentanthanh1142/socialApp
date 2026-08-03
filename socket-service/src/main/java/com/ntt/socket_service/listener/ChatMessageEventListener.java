package com.ntt.socket_service.listener;

import com.ntt.common_lib.event.chat.ChatMessageEvent;
import com.ntt.socket_service.service.ChatMessageSocketService;
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
public class ChatMessageEventListener {

    ChatMessageSocketService chatMessageSocketService;

    @KafkaListener(
            topics = "chat-topic",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleMessage(
            ChatMessageEvent event) {
        log.info("📥 Received ChatMessageEvent: type={}, participants={}, actor={}",
                event.getPayload().getType(), event.getParticipants(), event.getPayload().getSender().getId());
        try {
            chatMessageSocketService.sendMessage(event);
        } catch (Exception e) {
            log.error("Failed to send notification via socket for event {}", event, e);
        }
    }
}
