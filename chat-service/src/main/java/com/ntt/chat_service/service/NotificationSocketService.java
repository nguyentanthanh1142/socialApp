//package com.ntt.chat_service.service;
//
//import com.corundumstudio.socketio.SocketIOServer;
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.ntt.chat_service.dto.response.ChatMessageResponse;
//import com.ntt.chat_service.entity.WebSocketSession;
//import com.ntt.chat_service.repository.WebSocketSessionRepository;
//import com.ntt.common_lib.event.DomainNotificationEvent;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Objects;
//import java.util.UUID;
//
//@Service
//@Slf4j
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public class NotificationSocketService {
//
//    WebSocketSessionRepository webSocketSessionRepository;;
//    SocketIOServer socketIOServer;
//    ObjectMapper objectMapper;
//
//    public void sendNotification(DomainNotificationEvent event) {
//        String receiveId = event.getUserId();
//        List<WebSocketSession> sessions = webSocketSessionRepository.findAllByUserId(receiveId);
//
//        if(sessions.isEmpty()) {
//            log.info("User {} is offline, skipping realtime push", receiveId);
//            return;
//        }
//
//        sessions.forEach(session  -> {
//            var client = socketIOServer.getClient(UUID.fromString(session.getSocketSessionId()));
//            if (client != null && client.isChannelOpen() ) {
//                String message = "";
//                try {
//                    String payload = objectMapper.writeValueAsString(event);
//                    client.sendEvent("notification_message", payload);
//                } catch (JsonProcessingException e) {
//                    throw new RuntimeException(e);
//                }
//            }
//        });
//    }
//}
