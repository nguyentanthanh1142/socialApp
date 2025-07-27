package com.ntt.chat_service.mapper;

import com.ntt.chat_service.dto.repuest.ChatMessageRequest;
import com.ntt.chat_service.dto.response.ChatMessageResponse;
import com.ntt.chat_service.entity.ChatMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {

    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);
    ChatMessage toChatMessage(ChatMessageRequest request);

    List<ChatMessageResponse> toChatMessageResponses(List<ChatMessage> chatMessages);
}
