package com.ntt.common_lib.event.chat;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageEvent {

    String conversationId;
    ChatMessagePayload payload;
    List<String> participants;
}
