package com.ntt.feed_ai_service.dto;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

public record ChatRequest(String message) {

}
