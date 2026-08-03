package com.ntt.notification_service.service;

import com.ntt.common_lib.cache.PostCache;
import com.ntt.common_lib.dto.ActorDTO;
import com.ntt.common_lib.dto.CachedPostDTO;
import com.ntt.common_lib.dto.EntityDTO;
import com.ntt.common_lib.dto.PageResponse;
import com.ntt.common_lib.enums.NotificationType;
import com.ntt.common_lib.event.DomainNotificationEvent;
import com.ntt.notification_service.cache.PostCacheService;
import com.ntt.notification_service.cache.UserProfileCacheImpl;
import com.ntt.notification_service.dto.Actor;
import com.ntt.notification_service.dto.response.NotificationResponse;
import com.ntt.notification_service.entity.Notification;
import com.ntt.notification_service.mapper.NotificationMapper;
import com.ntt.notification_service.repository.httpclient.NotificationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {
    private final NotificationMapper notificationMapper;

    UserProfileCacheImpl userProfileCache;
    PostCacheService postCacheService;

    NotificationRepository repository;
    KafkaTemplate<String, DomainNotificationEvent> kafkaTemplate;


    public PageResponse<NotificationResponse> getNotifications(int page,int size) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

            Sort sort = Sort.by("createDate").descending();
            Pageable pageable = PageRequest.of(page - 1, size,sort);
            var pageData = repository.findAllByUserId(userId, pageable);

            var postList = pageData.stream().map(this::mapToResponse).toList();

            return PageResponse.<NotificationResponse>builder()
                    .currentPage(page)
                    .pageSize(pageData.getSize())
                    .totalElements(pageData.getTotalElements())
                    .totalPages(pageData.getTotalPages())
                    .data(postList)
                    .build();
    }


    public List<NotificationResponse> getUnreadNotifications() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Notification> notifications = repository.findByUserIdAndReadFalse(userId);
        return notifications.stream()
                .map(this::mapToResponse)
                .toList();
    }


    public Optional<Notification> createNotification(Notification notification) {
        boolean exists = repository.existsByPostIdAndUserIdAndActorIdAndType(
                notification.getPostId(),
                notification.getUserId(),
                notification.getActorId(),
                notification.getType()
        );

        if (exists) {
            return Optional.empty();
        }
        notification.setCreatedAt(Instant.now());
        notification.setRead(false);
        return Optional.of(repository.save(notification));
    }

//    public Notification createNotification(Notification notification) {
//        boolean checkExists = repository.existsByPostIdAndUserIdAndActorIdAndType(
//                 notification.getPostId(),
//                notification.getUserId(),
//                notification.getActorId(),
//                notification.getType()
//        );
//        if (checkExists) {
//            return null;
//        }
//        notification.setCreatedAt(Instant.now());
//        notification.setRead(false);
//        return repository.save(notification);
//    }


    public void handlePostLikedEvent(DomainNotificationEvent event) {
        createAndSendNotifications(event, NotificationType.LIKE);
    }

    public void handleCommentEvent(DomainNotificationEvent event) {
        createAndSendNotifications(event, NotificationType.COMMENT);
    }

    public void markAsRead(List<String> notificationIds) {
        List<Notification> notifications = repository.findAllById(notificationIds);
        notifications.forEach(n -> n.setRead(true));
        repository.saveAll(notifications);
    }

    private NotificationResponse mapToResponse(Notification notification) {

        var actorProfile = userProfileCache.getUserProfile(notification.getActorId());

        var actorDTO = ActorDTO.builder()
                .id(notification.getActorId())
                .name(actorProfile.getName())
                .avatarUrl(actorProfile.getAvatarUrl())
                .build();

       var entityDTO = getEntity(notification.getType(), notification.getPostId());
        return NotificationResponse.builder()
                .id(notification.getId())
                .actor(actorDTO)
                .entity(null)
                .type(notification.getType())
                .read(notification.isRead())
                .entity(entityDTO)
                .content(notification.getContent())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private void createAndSendNotifications(DomainNotificationEvent event,NotificationType type ){
        Notification notification = Notification.builder()
                .postId(event.getPostId())
                .userId(event.getUserId())
                .actorId(event.getActorId())
                .type(type)
                .content(type == NotificationType.COMMENT ? event.getContent() : null)
                .build();
        createNotification(notification);
        kafkaTemplate.send("notification-created", event);
    }

    private EntityDTO getEntity( NotificationType type,String entityId)
    {
        switch (type)
        {
            case LIKE, COMMENT:
                CachedPostDTO post =  postCacheService.getPost(entityId);
                if(post != null)
                {
                    String review = post.getContent() != null ? post.getContent()
                            .substring(0,Math.min(100, post.getContent().length())) : "";
                    String thumbnail = (post.getFiles() != null && !post.getFiles().isEmpty())
                            ? post.getFiles().getFirst().getUrl()
                            : null;
                    return EntityDTO.builder()
                            .id(post.getId())
                            .thumbnailUrl(thumbnail)
                            .type("post")
                            .contentPreview(review)
                            .build();

                }
                break;
            default:
                return null;
        }
        return null;
    }
}
