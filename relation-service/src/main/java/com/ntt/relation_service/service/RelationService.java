package com.ntt.relation_service.service;

import com.ntt.relation_service.dto.request.RelationRequest;
import com.ntt.relation_service.dto.response.RelationReponse;
import com.ntt.relation_service.entity.ParticipantInfo;
import com.ntt.relation_service.entity.Relation;
import com.ntt.relation_service.exception.AppException;
import com.ntt.relation_service.exception.ErrorCode;
import com.ntt.relation_service.mapper.RelationMapper;
import com.ntt.relation_service.repository.RelationRepository;
import com.ntt.relation_service.repository.htppclient.ProfileClient;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RelationService {

    RelationMapper relationMapper;
    RelationRepository relationRepository;
    ProfileClient profileClient;

    public RelationReponse createRelation(RelationRequest request) {

        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
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

        var conversation = relationRepository.findByParticipantsHash(userIdHash).orElseGet(()->
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


            Relation newRelation = Relation.builder()
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .participants(participantInfos)
                    .participantsHash(userIdHash)
                    .status(request.getStatus())
                    .build();

            return  relationRepository.save(newRelation);
        });
        return toConservationResponse(conversation);

    }

    public void getMyRelation(){
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Relation> relations = relationRepository.findAllByParticipantIdsContains(userId);
    }


    private RelationReponse toConservationResponse(Relation realation) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        RelationReponse response = relationMapper.toRelationReponse(realation);

        response.getParticipants().stream()
                .filter(participantInfo -> !participantInfo.getUserId().equals(currentUserId))
                .findFirst().ifPresent(participantInfo -> {
                    response.setConversationName(participantInfo.getUsername());
                    response.setConversationAvatar(participantInfo.getAvatar());
                });

        return response;
    }

    private String generateConservationHash(List<String> userIds) {

        return String.join("-", userIds);
    }
}

