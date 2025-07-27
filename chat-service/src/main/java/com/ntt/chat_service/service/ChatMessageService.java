package com.ntt.chat_service.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ntt.chat_service.dto.repuest.ChatMessageRequest;
import com.ntt.chat_service.dto.response.ChatMessageResponse;
import com.ntt.chat_service.entity.ChatMessage;
import com.ntt.chat_service.entity.ParticipantInfo;
import com.ntt.chat_service.entity.WebSocketSession;
import com.ntt.chat_service.exception.AppException;
import com.ntt.chat_service.exception.ErrorCode;
import com.ntt.chat_service.mapper.ChatMessageMapper;
import com.ntt.chat_service.repository.ChatMessageRepository;
import com.ntt.chat_service.repository.ConversationRepository;
import com.ntt.chat_service.repository.WebSocketSessionRepository;
import com.ntt.chat_service.repository.htppclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatMessageService {
    ChatMessageRepository repository;
    ChatMessageMapper chatMessageMapper;
    ConversationRepository conversationRepository;
    ProfileClient profileClient;
    SocketIOServer socketIOServer;
    WebSocketSessionRepository webSocketSessionRepository;
    ObjectMapper objectMapper;

    public List<ChatMessageResponse> getMessages(String conversationId) {

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        var conversation = conversationRepository.findById(conversationId).orElseThrow(()->
                new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        conversation.getParticipants().stream()
                .filter(participant -> userId.equals(participant.getUserId()))
                .findAny().orElseThrow(()->new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var messages = repository.findAllByConversationIdOrderByCreatedDateDesc(conversationId);
        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    public ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Creating chat message for user: {}", userId);
        log.info("request: {}", request);
        var conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(()->
                new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        log.info("conversation: {}", conversation);
        conversation.getParticipants().stream()
                .filter(participant -> userId.equals(participant.getUserId()))
                .findAny().orElseThrow(()->new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        log.info("participants: {}", conversation);
        var userResponse = profileClient.getProfile(userId);
        log.info("userResponse: {}", userResponse);
        if(Objects.isNull(userResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userResponse.getResult();

        ChatMessage chatmessage = chatMessageMapper.toChatMessage(request);
        chatmessage.setSender(ParticipantInfo.builder()
                .userId(userInfo.getUserId())
                .username(userInfo.getUsername())
                .firstname(userInfo.getFirstname())
                .lastname(userInfo.getLastname())
                .avatar(userInfo.getAvatar())
                .build());
        chatmessage.setCreatedDate(Instant.now());
        chatmessage = repository.save(chatmessage);




        List<String> participantIds = conversation.getParticipants().stream()
                .map(ParticipantInfo::getUserId)
                .toList();

        Map<String,WebSocketSession> webSocketSessions =
                webSocketSessionRepository.findAllByUserIdIn(participantIds)
                        .stream()
                        .collect(Collectors.toMap(WebSocketSession::getSocketSessionId, Function.identity()));
//        List<String> webSocketSessions = webSocketSessionRepository
//                .findAllByUserIdIn(participantIds).stream().
//                map(WebSocketSession::getSocketSessionId).toList();
        ChatMessageResponse chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatmessage);
        socketIOServer.getAllClients().forEach(client -> {
            var webSocketSessionIds = webSocketSessions.get(client.getSessionId().toString());

            if(Objects.nonNull(webSocketSessionIds)) {
                String message="";
                try{
                    chatMessageResponse.setMe( webSocketSessionIds.getUserId().equals(userId));
                    message = objectMapper.writeValueAsString(chatMessageResponse);
                    client.sendEvent("message", message);
                } catch(JsonProcessingException e){
                    throw new RuntimeException(e);
                }

            }
        });

        return toChatMessageResponse(chatmessage);
    }
    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        String userId =SecurityContextHolder.getContext().getAuthentication().getName();

        var ChatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);
        ChatMessageResponse.setMe(userId.equals(chatMessage.getSender().getUserId()));
        return ChatMessageResponse;
    }
}


