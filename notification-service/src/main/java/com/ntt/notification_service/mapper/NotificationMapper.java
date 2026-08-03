package com.ntt.notification_service.mapper;
import com.ntt.notification_service.dto.response.NotificationResponse;
import com.ntt.notification_service.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toResponse(Notification notification);
}
