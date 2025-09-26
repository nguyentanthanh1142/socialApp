package com.ntt.relation_service.service;

import com.ntt.relation_service.dto.request.RelationRequest;
import com.ntt.relation_service.dto.response.RelationReponse;
import com.ntt.relation_service.dto.response.SuggestionResponse;
import com.ntt.relation_service.dto.response.UserProfileResponse;
import com.ntt.relation_service.entity.ParticipantInfo;
import com.ntt.relation_service.entity.Relation;
import com.ntt.relation_service.enums.RelationStatus;
import com.ntt.relation_service.exception.AppException;
import com.ntt.relation_service.exception.ErrorCode;
import com.ntt.relation_service.mapper.RelationMapper;
import com.ntt.relation_service.repository.RelationRepository;
import com.ntt.relation_service.repository.htppclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RelationService {

    RelationMapper relationMapper;
    RelationRepository relationRepository;

    ProfileClient profileClient;

    public RelationReponse createRelation(RelationRequest request, RelationStatus status) {

        var userId = getCurrentUserId();
        log.info(userId);
        var userProfileResponse = profileClient.getProfile(userId);
        var participantInfoResponse = profileClient.getProfile(request.getParticipantIds().getFirst());
        log.info("ParticipantId" + request.getParticipantIds().getFirst());

        if (Objects.isNull(userProfileResponse) || Objects.isNull(participantInfoResponse)) {
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

        var relation = relationRepository.findByParticipantsHash(userIdHash).orElseGet(() ->
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
                    .status(request.getStatus().name())
                    .build();

            return relationRepository.save(newRelation);
        });


        return toRelationReponse(relation);

    }

    public RelationReponse updateRelationStatus(String relationId, RelationStatus status){
        String userId = getCurrentUserId();
        Relation relation = relationRepository.findByParticipantsHash(relationId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        boolean isParticipant = relation.getParticipants().stream().anyMatch(participant -> participant.getUserId().equals(userId));
        if(!isParticipant){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        relation.setStatus(status.name());
        relation.setModifiedDate(Instant.now());

        return relationMapper.toRelationReponse(relationRepository.save(relation));

    }



    public List<RelationReponse> getMyRelation() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Relation> relations = relationRepository.findAllByParticipantIdsContains(userId);
        return relations.stream().map(relation -> toRelationReponse(relation)).collect(Collectors.toList());
    }

    public List<RelationReponse> getMyFriendList() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Relation> relations = relationRepository.findAllByParticipantIdsContainsAndStatus(userId, RelationStatus.ACCEPTED.name());
        return relations.stream().map(relation -> toRelationReponse(relation)).collect(Collectors.toList());
    }

    public List<SuggestionResponse> listSuggestionFriends() {

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info(userId);

        List<Relation> myRelations = relationRepository.findAllByParticipantIdsContains(userId);
        log.info(myRelations.toString());

        Set<String> myRelationIds = myRelations.stream()
                .flatMap(r -> r.getParticipants().stream())
                .map(ParticipantInfo::getUserId)
                .filter(id -> !id.equals(userId))
                .collect(Collectors.toSet());


        Set<String> myFriendIds = myRelations.stream()
                .filter(r ->RelationStatus.ACCEPTED.name().equals(r.getStatus()))
                .flatMap(r -> r.getParticipants().stream())
                .map(ParticipantInfo::getUserId)
                .filter(id -> !id.equals(userId))
                .collect(Collectors.toSet());

        Set<String> candidateIds = new HashSet<>();

        if (!myFriendIds.isEmpty()) {
            for (String friendId : myFriendIds) {
                List<Relation> friendsRelations = relationRepository.findAllByParticipantIdsContainsAndStatus(friendId, RelationStatus.ACCEPTED.name());

                candidateIds.addAll(friendsRelations.stream()
                        .flatMap(r -> r.getParticipants().stream())
                        .map(ParticipantInfo::getUserId)
                        .filter(id -> !id.equals(friendId))
                        .filter(id -> !id.equals(userId))
                        .filter(id -> !myFriendIds.contains(id))
                        .collect(Collectors.toSet()));
            }
        }

        if(!candidateIds.isEmpty()) {
            log.info(candidateIds.toString());
            return profileClient.getProfiles(new ArrayList<>(candidateIds)).getResult()
                    .stream().map(profile -> {
                        return SuggestionResponse.builder()
                                    .avatar(profile.getAvatar())
                                    .userId(profile.getUserId())
                                    .username(profile.getUsername())
                                    .build();
                    }).toList();
            }
        else {
            List<UserProfileResponse> popularUsers = profileClient.getPopularProfiles().getResult();
            return popularUsers.stream()
                    .filter(u -> !u.getUserId().equals(userId))
                    .filter(u -> !myRelationIds.contains(u.getUserId()))
                    .map(profile -> SuggestionResponse.builder()
                            .avatar(profile.getAvatar())
                            .userId(profile.getUserId())
                            .username(profile.getUsername())
                            .build())
                    .toList();
        }
    }

    public List<RelationReponse> getMyFriendRequests(){
        String userId = getCurrentUserId();

        return getRelationsByStatus(RelationStatus.PENDING).stream()
                .filter(r -> !r.getOwnerId().equals(userId))
                .map(this::toRelationReponse)
                .toList();
    }

    public List<String> getFollowers(String userId){

        List<Relation> followers = relationRepository.findAllByParticipantIdsContainsAndStatus(userId,RelationStatus.ACCEPTED.name());

        return followers.stream()
                .flatMap(r -> r.getParticipants().stream())
                .map(p -> p.getUserId())                // lấy ra userId của participant
                .filter(id -> !id.equals(userId))       // bỏ chính mình ra
                .distinct()
                .collect(Collectors.toList());
    }

    private RelationReponse toRelationReponse(Relation relation) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        RelationReponse response = relationMapper.toRelationReponse(relation);

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
    private String getCurrentUserId(){
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    private List<Relation> getRelationsByStatus(RelationStatus status) {
        return relationRepository.findAllByParticipantIdsContainsAndStatus(getCurrentUserId(), status.name());
    }

}

