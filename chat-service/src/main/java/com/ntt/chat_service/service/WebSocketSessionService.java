package com.ntt.chat_service.service;


import com.ntt.chat_service.entity.WebSocketSession;
import com.ntt.chat_service.repository.WebSocketSessionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WebSocketSessionService {
    WebSocketSessionRepository repository;
    public WebSocketSession createWebSocketSession(WebSocketSession session) {
        return repository.save(session);
    }
    public void deleteSession(String sessionId) {
        repository.deleteBySocketSessionId(sessionId);
    }
    public WebSocketSession findByDevice(String deviceId) {
       return repository.findBySocketSessionId(deviceId);
    }
}
