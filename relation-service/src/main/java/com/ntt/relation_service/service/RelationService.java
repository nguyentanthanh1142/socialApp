package com.ntt.relation_service.service;

import com.ntt.common_lib.dto.PageResponse;
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

    public RelationReponse createRelation(RelationRequest request, RelationStatus status) {

        String userId = getCurrentUserId();
        String targetId = request.getParticipantIds().getFirst();

//        var profilesResponse = profileClient.getProfiles(List.of(userId, targetId));

        log.info("DEBUG -> userId (from Token): {}, targetId (from Request): {}", userId, targetId);

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

        List<String> sortedUserIds = List.of(userId, targetId).stream().sorted().toList();
        String userIdHash = generateConversationHash(sortedUserIds);

        var relation = relationRepository.findByParticipantsHash(userIdHash).orElseGet(() ->
        {
            List<ParticipantInfo> participantInfos = List.of(
                    mapToParticipant(userInfo),
                    mapToParticipant(targetInfo)
            );


            Relation newRelation = Relation.builder()
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .participants(participantInfos)
                    .participantsHash(userIdHash)
                    .status(status.name())
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

        if(status == RelationStatus.ACCEPTED){
            relation.setAcceptedDate(Instant.now());
        }

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

//    public List<SuggestionResponse> listSuggestionFriends() {
//
//        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
//        log.info("Fetching suggestions for userId: {}", userId);
//
//        // 1. Lấy tất cả quan hệ của mình (ACCEPTED, PENDING, BLOCKED...)
//        List<Relation> myRelations = relationRepository.findAllByParticipantIdsContains(userId);
//
//        // Set tất cả ID ĐÃ CÓ QUAN HỆ với mình (dùng để LỌC CHUẨN)
//        Set<String> myRelationIds = myRelations.stream()
//                .flatMap(r -> r.getParticipants().stream())
//                .map(ParticipantInfo::getUserId)
//                .collect(Collectors.toSet()); // Đã bao gồm cả userId của chính mình
//
//        // Set các ID ĐÃ LÀ BẠN (ACCEPTED)
//        Set<String> myFriendIds = myRelations.stream()
//                .filter(r -> RelationStatus.ACCEPTED.name().equals(r.getStatus()))
//                .flatMap(r -> r.getParticipants().stream())
//                .map(ParticipantInfo::getUserId)
//                .filter(id -> !id.equals(userId))
//                .collect(Collectors.toSet());
//
//        Map<String, Long> candidateMutualCountMap = new HashMap<>();
//
//        // 2. Tìm "Bạn của bạn" (Friends of Friends)
//        if (!myFriendIds.isEmpty()) {
//            // TỐI ƯU: Chỉ gọi DB 1 LẦN DUY NHẤT bằng toán tử IN thay vì vòng lặp FOR
//            List<Relation> friendsRelations = relationRepository.findAllByParticipantIdsInAndStatus(
//                    new ArrayList<>(myFriendIds),
//                    RelationStatus.ACCEPTED.name()
//            );
//
//            // Đếm số bạn chung và lọc chuẩn
//            candidateMutualCountMap = friendsRelations.stream()
//                    .flatMap(r -> r.getParticipants().stream())
//                    .map(ParticipantInfo::getUserId)
//                    .filter(id -> !myRelationIds.contains(id)) // FIX BUG: Bỏ toàn bộ người đã Friend/Pending/Block/Chính mình
//                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));
//        }
//
//        // Sắp xếp các Candidate theo SỐ BẠN CHUNG từ cao xuống thấp và lấy TOP 20
//        List<String> sortedCandidateIds = candidateMutualCountMap.entrySet().stream()
//                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
//                .limit(20)
//                .map(Map.Entry::getKey)
//                .toList();
//
//        // 3. Nếu tìm được Candidate từ bạn chung
//        if (!sortedCandidateIds.isEmpty()) {
//            log.info("Found FOF candidates: {}", sortedCandidateIds);
//            var profilesResponse = profileClient.getProfiles(sortedCandidateIds);
//
//            if (profilesResponse != null && profilesResponse.getResult() != null) {
//                return profilesResponse.getResult().stream()
//                        .map(profile -> SuggestionResponse.builder()
//                                .avatar(profile.getAvatar())
//                                .userId(profile.getUserId())
//                                .username(profile.getUsername())
//                                // .mutualFriendsCount(candidateMutualCountMap.getOrDefault(profile.getUserId(), 0L)) // Có thể trả thêm field này lên UI
//                                .build())
//                        .toList();
//            }
//        }
//
//        // 4. Fallback: Lấy danh sách Popular Profiles nếu không có Bạn của bạn
//        try {
//            var popularResponse = profileClient.getPopularProfiles();
//            if (popularResponse != null && popularResponse.getResult() != null) {
//                return popularResponse.getResult().stream()
//                        .filter(u -> u != null)
//                        .filter(u -> !myRelationIds.contains(u.getUserId())) // FIX BUG: Vẫn phải lọc người đã có relation
//                        .limit(20)
//                        .map(profile -> SuggestionResponse.builder()
//                                .avatar(profile.getAvatar())
//                                .userId(profile.getUserId())
//                                .username(profile.getUsername())
//                                .build())
//                        .toList();
//            }
//        } catch (Exception e) {
//            log.error("Error fetching popular profiles: ", e);
//        }
//
//        return Collections.emptyList();
//    }
public List<SuggestionResponse> listSuggestionFriends() {
    String userId = getCurrentUserId();
    log.info("Fetching suggestions for userId: {}", userId);

    List<Relation> myRelations = relationRepository.findAllByParticipantIdsContains(userId);

    Set<String> myRelationIds = myRelations.stream()
            .flatMap(r -> r.getParticipants().stream())
            .map(ParticipantInfo::getUserId)
            .collect(Collectors.toSet());

    Set<String> myFriendIds = myRelations.stream()
            .filter(r -> RelationStatus.ACCEPTED.name().equals(r.getStatus()))
            .flatMap(r -> r.getParticipants().stream())
            .map(ParticipantInfo::getUserId)
            .filter(id -> !id.equals(userId))
            .collect(Collectors.toSet());

    // 1. User mới chưa có bạn (Onboarding Flow) -> Gọi trực tiếp Onboarding Suggestions
    if (myFriendIds.isEmpty()) {
        log.info("User has no friends yet. Returning Onboarding/Popular suggestions.");
        return getOnboardingSuggestions(myRelationIds);
    }

    // 2. User đã có bạn -> Chạy chiến lược Friends of Friends (FOF)
    List<SuggestionResponse> fofSuggestions = getFOFSuggestions(myFriendIds, myRelationIds);
    if (!fofSuggestions.isEmpty()) {
        return fofSuggestions;
    }

    // 3. Fallback nếu FOF không ra kết quả
    return getOnboardingSuggestions(myRelationIds);
}

    public List<RelationReponse> getMyFriendRequests(){
        String userId = getCurrentUserId();

        return getRelationsByStatus(RelationStatus.PENDING).stream()
                .filter(r -> r.getParticipants() != null
                        && !r.getParticipants().isEmpty()
                        && !r.getParticipants().getFirst().getUserId().equals(userId))
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


        public PageResponse<RelationReponse> getListContactRelation(Pageable pageable) {
            String userId = getCurrentUserId();

            if (!pageable.getSort().isSorted()) {
                pageable = PageRequest.of(
                        pageable.getPageNumber(),
                        pageable.getPageSize(),
                        Sort.by("acceptedDate").descending()
                );
            }
            Pageable extendedPageable = PageRequest.of(pageable.getPageNumber(),pageable.getPageSize() +1,pageable.getSort());

            Page<Relation> relationData = relationRepository.findAllByParticipantIdsContainsAndStatus(userId, RelationStatus.ACCEPTED.name(), extendedPageable);

            List<Relation> relations = relationData.getContent();

            boolean hasNext = relations.size() > pageable.getPageSize();

            if (hasNext) {
                relations = relations.subList(0, pageable.getPageSize());
            }

            var relationResponseList = relations.stream().map(this::toRelationReponse).toList();

            return PageResponse.<RelationReponse>builder()
                    .hasNext(hasNext)
                    .data(relationResponseList)
                    .build();
        }


    private String generateConversationHash(List<String> userIds) {

        return String.join("-", userIds);
    }
    private String getCurrentUserId(){
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    private List<Relation> getRelationsByStatus(RelationStatus status) {
        return relationRepository.findAllByParticipantIdsContainsAndStatus(getCurrentUserId(), status.name());
    }

    private ParticipantInfo mapToParticipant(UserProfileResponse profile ){
        return ParticipantInfo.builder()
                .userId(profile.getUserId())
                .username(profile.getUsername())
                .firstname(profile.getFirstName())
                .lastname(profile.getLastName())
                .avatar(profile.getAvatarUrl())
                .build();
    }

    private List<SuggestionResponse> getFOFSuggestions (Set<String> myFriendIds, Set<String> myRelationIds)
    {
        List<Relation> friendsRelations = relationRepository.findAllByParticipantIdsInAndStatus(
                new ArrayList<>(myFriendIds),
                RelationStatus.ACCEPTED.name()
        );
        Map<String,Long> candidateMutualCountMap = friendsRelations.stream()
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
}

