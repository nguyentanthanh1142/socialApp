package com.ntt.socket_service.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ntt.common_lib.event.DomainNotificationEvent;
import com.ntt.common_lib.event.chat.ChatMessageEvent;
import com.ntt.socket_service.entity.WebSocketSession;
import com.ntt.socket_service.repository.WebSocketSessionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageSocketService {

    WebSocketSessionRepository webSocketSessionRepository;
    SocketIOServer socketIOServer;
    ObjectMapper objectMapper;

    public void sendMessage(ChatMessageEvent event) {

        List<WebSocketSession> sessions = webSocketSessionRepository.findAllByUserIdIn(event.getParticipants());

        if(sessions.isEmpty()) {
            log.info("User {} is offline, skipping realtime push", sessions);
            return;
        }

        sessions.forEach(session  -> {
            var client = socketIOServer.getClient(UUID.fromString(session.getSocketSessionId()));
            if (client != null && client.isChannelOpen() ) {
                String message = "";
                try {
                    boolean isMe = session.getUserId().equals(event.getPayload().getSender().getId());
                    event.getPayload().setMe(isMe);
                    String payload = objectMapper.writeValueAsString(event);
                    client.sendEvent("chat_message", payload);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }
        });
    }
}
