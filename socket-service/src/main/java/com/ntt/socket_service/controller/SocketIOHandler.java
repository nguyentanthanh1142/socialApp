package com.ntt.socket_service.controller;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.ntt.socket_service.dto.request.IntrospectRequest;
import com.ntt.socket_service.entity.WebSocketSession;
import com.ntt.socket_service.service.IdentityService;
import com.ntt.socket_service.service.WebSocketSessionService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SocketIOHandler {
        SocketIOServer server;
        IdentityService identityService;
        WebSocketSessionService webSocketSessionService;

    @OnConnect
    public void clientConnected(SocketIOClient client) {
        String token = client.getHandshakeData().getSingleUrlParam("token");
        String deviceId = client.getHandshakeData().getSingleUrlParam("deviceId");
        String tabId = client.getHandshakeData().getSingleUrlParam("tabId");


        if (token == null || token.isEmpty()) {
            log.warn("Client connected without token: {}", client.getSessionId());
            client.disconnect();
            return;
        }
        var introspectResponse = identityService.introspect(IntrospectRequest.builder()
                .token(token).build());

        if (!introspectResponse.isValid()) {
            log.warn("Invalid token for client: {}", client.getSessionId());
            client.disconnect();
            return;
        }

            String userId = introspectResponse.getUserId();
            String socketId = client.getSessionId().toString();

            log.info("Client connected: user={}, device={}, socket={}", userId, deviceId, socketId);

            WebSocketSession existing = webSocketSessionService.findByUserIdAndDeviceId(userId, deviceId);

            if (existing != null) {

                log.info("Found old session → delete {}", existing.getSocketSessionId());
                webSocketSessionService.deleteSession(existing.getSocketSessionId());
            }

            WebSocketSession webSocketSession = WebSocketSession.builder()
                    .socketSessionId(client.getSessionId().toString())
                    .userId(introspectResponse.getUserId())
                    .deviceId(deviceId)
                    .tabId(tabId)
                    .createdAt(Instant.now())
                    .build();

            webSocketSession = webSocketSessionService.createWebSocketSession(webSocketSession);
            log.info("WebSocket session created: {}", webSocketSession.getId());
    }

    @OnDisconnect
    public void clientDisconnected(SocketIOClient client) {
        log.info("Client disConnected: {}", client.getSessionId());
            webSocketSessionService.deleteSession(client.getSessionId().toString());
    }

        @PostConstruct
        public void startServer() {
            server.addListeners(this);
            server.start();
            log.info("SocketIO Server started");
        }
        @PreDestroy
        public void destroy() {
            server.stop();
            log.info("SocketIO Server stopped");
        }
}
