package com.ntt.chat_service.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.ntt.chat_service.dto.repuest.ChatMessageRequest;
import com.ntt.chat_service.dto.response.ChatMessageResponse;
import com.ntt.chat_service.service.ChatMessageService;
import com.ntt.common_lib.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("messages")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageController {
    ChatMessageService chatMessageService;
    @PostMapping("/create")
    ApiResponse<ChatMessageResponse> createChatMessage(@Valid @RequestBody ChatMessageRequest request) throws JsonProcessingException {
        return ApiResponse.<ChatMessageResponse>builder()
                .result(chatMessageService.create(request))
                .build();
    }
    @GetMapping
    ApiResponse<List<ChatMessageResponse>> createChatMessage(@RequestParam("conversationId") String conversationId) {
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(chatMessageService.getMessages(conversationId))
                .build();
    }
}
