package com.ntt.chat_service.mapper;


import com.ntt.chat_service.dto.response.ConversationResponse;
import com.ntt.chat_service.entity.Conversation;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ConversationMapper {

    ConversationResponse toConversationResponse(Conversation conversation);

    List<ConversationResponse> toConversationResponseList(List<Conversation> conversations);
}
