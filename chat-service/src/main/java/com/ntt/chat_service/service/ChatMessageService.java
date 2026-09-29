package com.ntt.chat_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ntt.chat_service.dto.repuest.ChatMessageRequest;
import com.ntt.chat_service.dto.response.ChatMessageResponse;
import com.ntt.chat_service.entity.ChatMessage;
import com.ntt.chat_service.entity.Conversation;
import com.ntt.chat_service.entity.ParticipantInfo;
import com.ntt.chat_service.exception.AppException;
import com.ntt.chat_service.exception.ErrorCode;
import com.ntt.chat_service.mapper.ChatMessageMapper;
import com.ntt.chat_service.repository.ChatMessageRepository;
import com.ntt.chat_service.repository.ConversationRepository;
import com.ntt.chat_service.repository.htppclient.ProfileClient;
import com.ntt.common_lib.dto.UserInfo;
import com.ntt.common_lib.enums.ChatMessageType;
import com.ntt.common_lib.event.chat.ChatMessageEvent;
import com.ntt.common_lib.event.chat.ChatMessagePayload;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.User;
import org.springframework.kafka.core.KafkaTemplate;
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
    KafkaTemplate<String, Object> kafkaTemplate;
//    SocketIOServer socketIOServer;
    ObjectMapper objectMapper;

    public List<ChatMessageResponse> getMessages(String conversationId) {

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        var conversation = conversationRepository.findById(conversationId).orElseThrow(() ->
                new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        conversation.getParticipants().stream()
                .filter(participant -> userId.equals(participant.getUserId()))
                .findAny().orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var messages = repository.findAllByConversationIdOrderByCreatedDateDesc(conversationId);
        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    public ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Creating chat message for user: {}", userId);
        log.info("request: {}", request);

        Conversation conversation = null;

        if (request.getConversationId() != null && !request.getConversationId().trim().isEmpty()) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        } else if (request.getRecipientId() != null && !request.getRecipientId().trim().isEmpty()) {
            String recipientId = request.getRecipientId();

            if (userId.equals(recipientId)) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }

            String participantsHash = generateParticipantsHash(userId, recipientId);

            conversation = conversationRepository.findByParticipantsHash(participantsHash)
                    .orElseGet(() -> {
                        // Nếu chưa có -> Tự động tạo mới phòng chat 1-1 ngay tại đây
                        log.info("Creating new direct conversation between {} and {}", userId, recipientId);

                        var senderProfile = profileClient.getProfile(userId).getResult();
                        var recipientProfile = profileClient.getProfile(recipientId).getResult();

                        var newConversation = Conversation.builder()
                                .participantsHash(participantsHash)
                                .participants(List.of(
                                        ParticipantInfo.builder()
                                                .userId(senderProfile.getUserId())
                                                .username(senderProfile.getUsername())
                                                .firstname(senderProfile.getFirstname())
                                                .lastname(senderProfile.getLastname())
                                                .avatar(senderProfile.getAvatar())
                                                .build(),
                                        ParticipantInfo.builder()
                                                .userId(recipientProfile.getUserId())
                                                .username(recipientProfile.getUsername())
                                                .firstname(recipientProfile.getFirstname())
                                                .lastname(recipientProfile.getLastname())
                                                .avatar(recipientProfile.getAvatar())
                                                .build()
                                ))
                                .createdDate(Instant.now())
                                .build();

                        return conversationRepository.save(newConversation);
                    });
        } else {
            throw new AppException(ErrorCode.CONVERSATION_NOT_FOUND);
        }

        log.info("conversation: {}", conversation);

        conversation.getParticipants().stream()
                .filter(participant -> userId.equals(participant.getUserId()))
                .findAny().orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var userResponse = profileClient.getProfile(userId);
        log.info("userResponse: {}", userResponse);
        if (Objects.isNull(userResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userResponse.getResult();

        request.setConversationId(conversation.getId());

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

        ChatMessagePayload messagePayload = ChatMessagePayload.builder()
                .id(chatmessage.getId())
                .createdDate(chatmessage.getCreatedDate())
                .content(chatmessage.getMessage())
                .mediaUrl("")
                .type(ChatMessageType.TEXT)
                .sender(UserInfo.builder()
                        .name(userInfo.getUsername())
                        .avatarUrl(userInfo.getAvatar())
                        .id(userInfo.getUserId())
                        .build())
                .build();

        ChatMessageEvent chatMessageEvent = ChatMessageEvent.builder()
                .conversationId(conversation.getId())
                .participants(participantIds)
                .payload(messagePayload)
                .build();

        kafkaTemplate.send("chat-topic", chatMessageEvent);

        return toChatMessageResponse(chatmessage);
    }

    private String generateParticipantsHash(String userId1, String userId2) {
        List<String> sortedIds = List.of(userId1, userId2).stream().sorted().toList();
        return String.join("-", sortedIds);
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        var ChatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);
        ChatMessageResponse.setMe(userId.equals(chatMessage.getSender().getUserId()));
        return ChatMessageResponse;
    }
}


