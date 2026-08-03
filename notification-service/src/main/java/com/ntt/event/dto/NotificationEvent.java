package com.ntt.event.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEvent {
    String chanel;
    String recipient;
    String templateCode;
    String templateId;
    Map<String,Object> params;
    String subject;
    String body;
}
