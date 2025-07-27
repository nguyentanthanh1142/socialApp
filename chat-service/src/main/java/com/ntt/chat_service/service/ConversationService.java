package com.ntt.chat_service.service;

import com.ntt.chat_service.dto.repuest.ConversationRequest;
import com.ntt.chat_service.dto.response.ConversationResponse;
import com.ntt.chat_service.entity.Conversation;
import com.ntt.chat_service.entity.ParticipantInfo;
import com.ntt.chat_service.exception.AppException;
import com.ntt.chat_service.exception.ErrorCode;
import com.ntt.chat_service.mapper.ConversationMapper;
import com.ntt.chat_service.repository.ConversationRepository;
import com.ntt.chat_service.repository.htppclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ConversationService {
    ProfileClient profileClient;
    ConversationRepository conversationRepository;
    ConversationMapper conversationMapper;

    public List<ConversationResponse> myConversations() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info(userId);
        List<Conversation> conservations = conversationRepository.findAllByParticipantIdsContains(userId);
        log.info(conservations.toString());

        return conservations.stream().map(this::toConservationResponse).toList();
    }

    public ConversationResponse createConservation(ConversationRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info(userId);
        var userProfileResponse = profileClient.getProfile(userId);
        var participantInfoResponse = profileClient.getProfile(request.getParticipantIds().getFirst());
        log.info("ParticipantId" + request.getParticipantIds().getFirst());

        if(Objects.isNull(userProfileResponse) || Objects.isNull(participantInfoResponse)) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        var userInfo = userProfileResponse.getResult();
        var participantInfo = participantInfoResponse.getResult();
        List<String> userIds = new ArrayList<>();
        userIds.add(userId);
        userIds.add(participantInfo.getUserId());
        log.info("List user IDS" + userIds);
        var sortedUserIds = userIds.stream().sorted().toList();
        String userIdHash = generateConservationHash(sortedUserIds);

        var conversation = conversationRepository.findByParticipantsHash(userIdHash).orElseGet(()->
                {
                    List<ParticipantInfo> participantInfos = List.of(
                            ParticipantInfo.builder()
                                    .userId(userId)
                                    .username(userInfo.getUsername())
                                    .firstname(userInfo.getFirstname())
                                    .lastname(userInfo.getLastname())
                                    .avatar(userInfo.getAvatar())
                                    .build(),
                            ParticipantInfo.builder()
                                    .userId(participantInfo.getUserId())
                                    .username(participantInfo.getUsername())
                                    .firstname(participantInfo.getFirstname())
                                    .lastname(participantInfo.getLastname())
                                    .avatar(participantInfo.getAvatar())
                                    .build()
                    );


                    Conversation newConservation = Conversation.builder()
                            .createdDate(Instant.now())
                            .modifiedDate(Instant.now())
                            .participants(participantInfos)
                            .participantsHash(userIdHash)
                            .type(request.getType())
                            .build();

                    return  conversationRepository.save(newConservation);
        });
        return toConservationResponse(conversation);

    }
    private String generateConservationHash(List<String> userIds) {

        return String.join("-", userIds);
    }
    private ConversationResponse toConservationResponse(Conversation conversation) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        ConversationResponse response = conversationMapper.toConversationResponse(conversation);

        response.getParticipants().stream()
                .filter(participantInfo -> !participantInfo.getUserId().equals(currentUserId))
                .findFirst().ifPresent(participantInfo -> {
                    response.setConversationName(participantInfo.getUsername());
                    response.setConversationAvatar(participantInfo.getAvatar());
                });

        return response;
    }

}
