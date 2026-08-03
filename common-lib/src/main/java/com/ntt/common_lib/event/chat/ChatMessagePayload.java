package com.ntt.common_lib.event.chat;

import com.ntt.common_lib.dto.UserInfo;
import com.ntt.common_lib.enums.ChatMessageType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessagePayload {
    String id;
    UserInfo sender;
    ChatMessageType type;
    String content;
    String mediaUrl;
    Instant createdDate;
    boolean me;
}
