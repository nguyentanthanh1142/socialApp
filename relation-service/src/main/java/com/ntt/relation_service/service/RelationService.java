package com.ntt.relation_service.service;

import com.ntt.common_lib.dto.PageResponse;
import com.ntt.relation_service.dto.request.RelationRequest;
import com.ntt.relation_service.dto.response.RelationResponse;
import com.ntt.relation_service.dto.response.RelationStatusResponse;
import com.ntt.relation_service.dto.response.SuggestionResponse;
import com.ntt.relation_service.dto.response.UserProfileResponse;
import com.ntt.relation_service.entity.ParticipantInfo;
import com.ntt.relation_service.entity.Relation;
import com.ntt.relation_service.enums.RelationAction;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    public RelationResponse createRelation(RelationRequest request, RelationStatus status) {

        String userId = getCurrentUserId();
        String targetId = request.getParticipantIds().getFirst();

        if (userId.equals(targetId)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var profilesResponse = profileClient.getProfiles(List.of(userId, targetId));

        log.info("DEBUG -> Fetched profiles count: {}",
                (profilesResponse != null && profilesResponse.getResult() != null) ? profilesResponse.getResult().size() : 0);
        if (profilesResponse == null || profilesResponse.getResult() == null || profilesResponse.getResult().size() < 2) {
            throw new AppException(ErrorCode.RELATIONSHIP_NOT_FOUND);
        }

        Map<String, UserProfileResponse> profileMap = profilesResponse.getResult().stream()
                .collect(Collectors.toMap(UserProfileResponse::getUserId, profile -> profile));

        var userInfo = profileMap.get(userId);
        var targetInfo = profileMap.get(targetId);

        String userIdHash = generateConversationHash(userId, targetId);

        Optional<Relation> existingRelation = relationRepository.findByParticipantsHash(userIdHash);

        Relation relation;
        if (existingRelation.isPresent()) {
            relation = existingRelation.get();
            RelationStatus currentStatus = relation.getStatus();
            if (currentStatus == RelationStatus.ACCEPTED) {
                throw new AppException(ErrorCode.ALREADY_FRIENDS);
            } else if (currentStatus.equals(RelationStatus.BLOCKED)) {
                throw new AppException(ErrorCode.ACTION_NOT_ALLOWED);
            } else if (currentStatus.equals(RelationStatus.PENDING)) {
                if (userId.equals(relation.getOwnerId())) {
                    return toRelationReponse(relation);
                } else {
                    relation.setStatus(RelationStatus.ACCEPTED);
                    relation.setAcceptedDate(Instant.now());
                    relation.setModifiedDate(Instant.now());
                    relation = relationRepository.save(relation);
                    return toRelationReponse(relation);
                }
            }
        }

        List<ParticipantInfo> participantInfos = List.of(
                mapToParticipant(userInfo),
                mapToParticipant(targetInfo)
        );

        Relation newRelation = Relation.builder()
                .ownerId(userId)
                .createdDate(Instant.now())
                .modifiedDate(Instant.now())
                .participants(participantInfos)
                .participantsHash(userIdHash)
                .status(status)
                .build();

        relation = relationRepository.save(newRelation);
        return toRelationReponse(relation);
    }

    public RelationResponse updateRelationStatus(String relationId, RelationStatus status) {
        String userId = getCurrentUserId();
        Relation relation = relationRepository.findByParticipantsHash(relationId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        boolean isParticipant = relation.getParticipants().stream().anyMatch(participant -> participant.getUserId().equals(userId));
        if (!isParticipant) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        relation.setStatus(status);
        relation.setModifiedDate(Instant.now());

        if (status == RelationStatus.ACCEPTED) {
            relation.setAcceptedDate(Instant.now());
        }

        return relationMapper.toRelationReponse(relationRepository.save(relation));
    }

    public List<RelationResponse> getMyFriendList() {
        String userId = getCurrentUserId();
        List<Relation> relations = relationRepository.findAllByParticipantIdsContainsAndStatus(userId, RelationStatus.ACCEPTED);
        return relations.stream().map(this::toRelationReponse).collect(Collectors.toList());
    }

    public RelationStatusResponse getRelationshipStatusForCurrentUser(String targetId) {
        return getRelationshipStatus(getCurrentUserId(), targetId);
    }

    public RelationResponse updateRelationWithTarget(String targetUserId, RelationStatus status) {
        String userId = getCurrentUserId();
        String relationHash = generateConversationHash(userId, targetUserId);
        return updateRelationStatus(relationHash, status);
    }

    public RelationStatusResponse getRelationshipStatus(String viewerId, String targetId) {
        String relationHash = generateConversationHash(viewerId, targetId);

        return relationRepository.findByParticipantsHash(relationHash)
                .map(relation -> toRelationStatusResponse(relation, viewerId, targetId))
                .orElseGet(() -> RelationStatusResponse.builder()
                        .targetUserId(targetId)
                        .status(RelationStatus.NONE)
                        .isIssuer(false)
                        .isFollowing(false)
                        .isBlocked(false)
                        .availableActions(List.of(RelationAction.SEND_REQUEST, RelationAction.BLOCK))
                        .build());
    }

    public List<SuggestionResponse> listSuggestionFriends() {
        String userId = getCurrentUserId();
        log.info("Fetching suggestions for userId: {}", userId);

        List<Relation> myRelations = relationRepository.findAllByParticipantIdsContains(userId);

        Set<String> myRelationIds = myRelations.stream()
                .flatMap(r -> r.getParticipants().stream())
                .map(ParticipantInfo::getUserId)
                .collect(Collectors.toSet());

        Set<String> myFriendIds = myRelations.stream()
                .filter(r -> RelationStatus.ACCEPTED.equals(r.getStatus()))
                .flatMap(r -> r.getParticipants().stream())
                .map(ParticipantInfo::getUserId)
                .filter(id -> !id.equals(userId))
                .collect(Collectors.toSet());

        if (myFriendIds.isEmpty()) {
            log.info("User has no friends yet. Returning Onboarding/Popular suggestions.");
            return getOnboardingSuggestions(myRelationIds);
        }

        List<SuggestionResponse> fofSuggestions = getFOFSuggestions(myFriendIds, myRelationIds);
        if (!fofSuggestions.isEmpty()) {
            return fofSuggestions;
        }

        return getOnboardingSuggestions(myRelationIds);
    }

    public List<RelationResponse> getMyFriendRequests() {
        String userId = getCurrentUserId();

        return getRelationsByStatus(RelationStatus.PENDING).stream()
                .filter(r -> r.getParticipants() != null
                        && !r.getParticipants().isEmpty()
                        && !r.getParticipants().getFirst().getUserId().equals(userId))
                .map(this::toRelationReponse)
                .toList();
    }

    public List<String> getFollowers(String userId) {
        List<Relation> followers = relationRepository.findAllByParticipantIdsContainsAndStatus(userId, RelationStatus.ACCEPTED);

        return followers.stream()
                .flatMap(r -> r.getParticipants().stream())
                .map(ParticipantInfo::getUserId)
                .filter(id -> !id.equals(userId))
                .distinct()
                .collect(Collectors.toList());
    }

    public void unfriend(String targetUserId) {
        String userId = getCurrentUserId();
        String relationHash = generateConversationHash(userId, targetUserId);

        Relation relation = relationRepository.findByParticipantsHash(relationHash)
                .orElseThrow(() -> new AppException(ErrorCode.RELATIONSHIP_NOT_FOUND));

        if (relation.getStatus() != RelationStatus.ACCEPTED) {
            throw new AppException(ErrorCode.RELATIONSHIP_NOT_FOUND);
        }

        relationRepository.delete(relation);
    }

    public void cancelRequest(String targetUserId) {
        String userId = getCurrentUserId();
        String relationHash = generateConversationHash(userId, targetUserId);

        Relation relation = relationRepository.findByParticipantsHash(relationHash)
                .orElseThrow(() -> new AppException(ErrorCode.RELATIONSHIP_NOT_FOUND));

        if (relation.getStatus() != RelationStatus.PENDING || !userId.equals(relation.getOwnerId())) {
            throw new AppException(ErrorCode.RELATIONSHIP_NOT_FOUND);
        }

        relationRepository.delete(relation);
    }

    public RelationResponse blockUser(String targetUserId) {
        String userId = getCurrentUserId();
        String relationHash = generateConversationHash(userId, targetUserId);

        var profilesResponse = profileClient.getProfiles(List.of(userId, targetUserId));
        if (profilesResponse == null || profilesResponse.getResult() == null || profilesResponse.getResult().size() < 2) {
            throw new AppException(ErrorCode.RELATIONSHIP_NOT_FOUND);
        }

        Map<String, UserProfileResponse> profileMap = profilesResponse.getResult().stream()
                .collect(Collectors.toMap(UserProfileResponse::getUserId, profile -> profile));

        var userInfo = profileMap.get(userId);
        var targetInfo = profileMap.get(targetUserId);

        Relation relation = relationRepository.findByParticipantsHash(relationHash).orElseGet(() -> {
            List<ParticipantInfo> participantInfos = List.of(
                    mapToParticipant(userInfo),
                    mapToParticipant(targetInfo)
            );

            return Relation.builder()
                    .ownerId(userId)
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .participants(participantInfos)
                    .participantsHash(relationHash)
                    .status(RelationStatus.BLOCKED)
                    .build();
        });

        relation.setStatus(RelationStatus.BLOCKED);
        relation.setOwnerId(userId);
        relation.setModifiedDate(Instant.now());

        return toRelationReponse(relationRepository.save(relation));
    }

    public void unblockUser(String targetUserId) {
        String userId = getCurrentUserId();
        String relationHash = generateConversationHash(userId, targetUserId);

        Relation relation = relationRepository.findByParticipantsHash(relationHash)
                .orElseThrow(() -> new AppException(ErrorCode.RELATIONSHIP_NOT_FOUND));

        if (relation.getStatus() != RelationStatus.BLOCKED || !userId.equals(relation.getOwnerId())) {
            throw new AppException(ErrorCode.RELATIONSHIP_NOT_FOUND);
        }

        relationRepository.delete(relation);
    }

    private RelationResponse toRelationReponse(Relation relation) {
        String currentUserId = getCurrentUserId();
        RelationResponse response = relationMapper.toRelationReponse(relation);

        response.getParticipants().stream()
                .filter(participantInfo -> !participantInfo.getUserId().equals(currentUserId))
                .findFirst().ifPresent(participantInfo -> {
                    String fullName = buildFullName(participantInfo.getFirstName(), participantInfo.getLastName(), participantInfo.getUsername());
                    response.setConversationName(fullName);
                    response.setConversationName(participantInfo.getUsername());
                    response.setConversationAvatar(participantInfo.getAvatarUrl());
                });

        return response;
    }

    public PageResponse<RelationResponse> getListContactRelation(Pageable pageable) {
        String userId = getCurrentUserId();

        if (!pageable.getSort().isSorted()) {
            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by("acceptedDate").descending()
            );
        }
        Pageable extendedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize() + 1, pageable.getSort());

        Page<Relation> relationData = relationRepository.findAllByParticipantIdsContainsAndStatus(userId, RelationStatus.ACCEPTED, extendedPageable);

        List<Relation> relations = relationData.getContent();

        boolean hasNext = relations.size() > pageable.getPageSize();

        if (hasNext) {
            relations = relations.subList(0, pageable.getPageSize());
        }

        var relationResponseList = relations.stream().map(this::toRelationReponse).toList();

        return PageResponse.<RelationResponse>builder()
                .hasNext(hasNext)
                .data(relationResponseList)
                .build();
    }

    private String generateConversationHash(String userA, String userB) {
        List<String> sortedIds = List.of(userA, userB).stream().sorted().toList();
        return String.join("-", sortedIds);
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private List<Relation> getRelationsByStatus(RelationStatus status) {
        return relationRepository.findAllByParticipantIdsContainsAndStatus(getCurrentUserId(), status);
    }

    private ParticipantInfo mapToParticipant(UserProfileResponse profile) {
        return ParticipantInfo.builder()
                .userId(profile.getUserId())
                .username(profile.getUsername())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .avatarUrl(profile.getAvatarUrl())
                .build();
    }

    private List<SuggestionResponse> getFOFSuggestions(Set<String> myFriendIds, Set<String> myRelationIds) {
        List<Relation> friendsRelations = relationRepository.findAllByParticipantIdsInAndStatus(
                new ArrayList<>(myFriendIds),
                RelationStatus.ACCEPTED
        );
        Map<String, Long> candidateMutualCountMap = friendsRelations.stream()
                .flatMap(r -> r.getParticipants().stream())
                .map(ParticipantInfo::getUserId)
                .filter(id -> !myRelationIds.contains(id))
                .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

        List<String> sortedCandidateIds = candidateMutualCountMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(20)
                .map(Map.Entry::getKey)
                .toList();

        if (sortedCandidateIds.isEmpty()) {
            return Collections.emptyList();
        }
        var profilesResponse = profileClient.getProfiles(sortedCandidateIds);
        if (profilesResponse == null || profilesResponse.getResult() == null) {
            return Collections.emptyList();
        }

        return profilesResponse.getResult().stream()
                .map(profile -> {
                    int mutualCount = candidateMutualCountMap.getOrDefault(profile.getUserId(), 0L).intValue();
                    return SuggestionResponse.builder()
                            .userId(profile.getUserId())
                            .username(profile.getUsername())
                            .fullName(buildFullName(profile.getFirstName(), profile.getLastName(), profile.getUsername()))
                            .avatarUrl(profile.getAvatarUrl())
                            .mutualFriendsCount(mutualCount)
                            .headline(mutualCount + " bạn chung")
                            .build();
                })
                .toList();
    }

    private List<SuggestionResponse> getOnboardingSuggestions(Set<String> myRelationIds) {
        try {
            var popularResponse = profileClient.getPopularProfiles();
            if (popularResponse != null && popularResponse.getResult() != null) {
                return popularResponse.getResult().stream()
                        .filter(Objects::nonNull)
                        .filter(u -> !myRelationIds.contains(u.getUserId()))
                        .limit(20)
                        .map(profile -> SuggestionResponse.builder()
                                .userId(profile.getUserId())
                                .username(profile.getUsername())
                                .fullName(buildFullName(profile.getFirstName(), profile.getLastName(), profile.getUsername()))
                                .avatarUrl(profile.getAvatarUrl())
                                .mutualFriendsCount(0)
                                .headline("Gợi ý kết bạn")
                                .build())
                        .toList();
            }
        } catch (Exception e) {
            log.error("Error fetching popular profiles for onboarding: ", e);
        }
        return Collections.emptyList();
    }

    private String buildFullName(String firstName, String lastName, String defaultUsername) {
        String first = firstName != null ? firstName.trim() : "";
        String last = lastName != null ? lastName.trim() : "";
        String fullName = (first + " " + last).trim();
        return fullName.isEmpty() ? defaultUsername : fullName;
    }

    private RelationStatusResponse toRelationStatusResponse(Relation relation, String viewerId, String targetId) {
        boolean isIssuer = relation.getOwnerId() != null
                ? viewerId.equals(relation.getOwnerId())
                : (relation.getParticipants() != null && !relation.getParticipants().isEmpty()
                && viewerId.equals(relation.getParticipants().getFirst().getUserId()));

        RelationStatus status = Optional.ofNullable(relation.getStatus()).orElse(RelationStatus.NONE);

        return RelationStatusResponse.builder()
                .targetUserId(targetId)
                .status(status)
                .isIssuer(isIssuer)
                .isFollowing(status == RelationStatus.ACCEPTED)
                .isBlocked(status == RelationStatus.BLOCKED)
                .updatedAt(relation.getModifiedDate() != null ? relation.getModifiedDate().toString() : null)
                .availableActions(availableActions(status, isIssuer))
                .build();
    }

    private List<RelationAction> availableActions(RelationStatus status, boolean isIssuer) {
        switch (status) {
            case PENDING:
                return isIssuer ? List.of(RelationAction.CANCEL_REQUEST) : List.of(RelationAction.ACCEPT_REQUEST, RelationAction.REJECT_REQUEST);
            case ACCEPTED:
                return List.of(RelationAction.UNFRIEND);
            case BLOCKED:
                return List.of(RelationAction.UNBLOCK);
            default:
                return List.of(RelationAction.SEND_REQUEST, RelationAction.BLOCK);
        }
    }
}