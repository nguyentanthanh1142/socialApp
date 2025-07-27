package com.ntt.chat_service.dto.response;

import com.ntt.chat_service.entity.ParticipantInfo;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    String id;
    String message;
    String conversationId;
    boolean me;
    ParticipantInfo sender;
    Instant createdDate;
}
