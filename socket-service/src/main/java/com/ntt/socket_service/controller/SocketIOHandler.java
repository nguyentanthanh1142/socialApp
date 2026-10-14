package com.ntt.socket_service.controller;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.ntt.socket_service.dto.request.IntrospectRequest;
import com.ntt.socket_service.entity.WebSocketSession;
import com.ntt.socket_service.service.IdentityService;
import com.ntt.socket_service.service.UserPresenceService;
import com.ntt.socket_service.service.WebSocketSessionService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SocketIOHandler {
    SocketIOServer server;
    IdentityService identityService;
    WebSocketSessionService webSocketSessionService;
    UserPresenceService userPresenceService;

    private final ExecutorService socketWorkerPool = Executors.newFixedThreadPool(
            Math.max(4, Runtime.getRuntime().availableProcessors() * 2),
            r -> {
                Thread t = new Thread(r);
                t.setName("socket-io-worker-" + t.getId());
                t.setDaemon(true);
                return t;
            }
    );

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
        socketWorkerPool.submit(() -> {
            try {
                var introspectResponse = identityService.introspect(IntrospectRequest.builder()
                        .token(token).build());

                if (!introspectResponse.isValid()) {
                    log.warn("Invalid token for client: {}", client.getSessionId());
                    client.disconnect();
                    return;
                }

                String userId = introspectResponse.getUserId();
                String newSocketId = client.getSessionId().toString();

                log.info("Client connected: user={}, device={}, socket={}", userId, deviceId, newSocketId);

                WebSocketSession existing = webSocketSessionService.findByUserIdAndDeviceId(userId, deviceId);

                if (existing != null) {
                    String oldSocketId = existing.getSocketSessionId();
                    log.info("Found old session for device → cleaning up old socket: {}", oldSocketId);

                    webSocketSessionService.deleteSession(oldSocketId);

                    userPresenceService.handleUserDisconnect(userId, oldSocketId);
                }

                WebSocketSession webSocketSession = WebSocketSession.builder()
                        .socketSessionId(newSocketId)
                        .userId(userId)
                        .deviceId(deviceId)
                        .tabId(tabId)
                        .createdAt(Instant.now())
                        .build();

                webSocketSessionService.createWebSocketSession(webSocketSession);
                log.info("WebSocket session created: {}", webSocketSession.getId());

                boolean justOnline = userPresenceService.handleUserConnect(userId, newSocketId);

                if (justOnline) {
                    server.getBroadcastOperations().sendEvent("user_presence_changed", Map.of(
                            "userId", userId,
                            "status", "ONLINE",
                            "lastSeen", ""
                    ));
                }
            } catch (Exception e) {
                log.error("Error during socket connection for client: {}", client.getSessionId(), e);
                client.disconnect();
            }
        });
    }

    @OnDisconnect
    public void clientDisconnected(SocketIOClient client) {
        String socketSessionId = client.getSessionId().toString();
        log.info("Client disConnected: {}", socketSessionId);

        socketWorkerPool.submit(() -> {
            try {
                var session = webSocketSessionService.findBySocketSessionId(socketSessionId);
                webSocketSessionService.deleteSession(socketSessionId);
                if (session != null) {
                    String userId = session.getUserId();
                    boolean justOffline = userPresenceService.handleUserDisconnect(userId, socketSessionId);
                    if (justOffline) {
                        log.info("User {} is fully disconnected", userId);
                        var presence = userPresenceService.getUserPresence(userId);
                        server.getBroadcastOperations().sendEvent("user_presence_changed", presence);
                    }
                }
            } catch (Exception e) {
                log.error("Error during socket disconnection", e);
            }
        });
    }


    @OnEvent("typing_start")
    public void onTypingStart(SocketIOClient client, Map<String, Object> data) {
        String conversationId = (String) data.get("conversationId");
        Boolean isTyping = (Boolean) data.get("isTyping");

        if (conversationId == null) {
            return;
        }

        log.info("User typing event in conversation {}: isTyping={}", conversationId, isTyping);

        for (SocketIOClient c : server.getRoomOperations(conversationId).getClients()) {
            if (!c.getSessionId().equals(client.getSessionId())) {
                c.sendEvent("user_typing", Map.of(
                        "conversationId", conversationId,
                        "isTyping", isTyping != null ? isTyping : false
                ));
            }
        }
    }

    @OnEvent("join_room")
    public void onJoinRoom(SocketIOClient client, java.util.Map<String, Object> data) {
        String conversationId = (String) data.get("conversationId");
        String userId = client.get("userId"); // Lấy từ memory, không cần query DB

        if (conversationId != null && userId != null) {
            // if (!conversationService.isMember(userId, conversationId)) return;

            client.joinRoom(conversationId);
            log.info("Client {} (user: {}) joined room: {}", client.getSessionId(), userId, conversationId);
        }
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
        socketWorkerPool.shutdown();
        log.info("SocketIO Server stopped");
    }
}
