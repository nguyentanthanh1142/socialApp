package com.ntt.relation_service.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SuggestionResponse {
    private String userId;
    private String username;
    private String avatar;
}
