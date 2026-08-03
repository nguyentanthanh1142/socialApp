package com.ntt.notification_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmailRequest {
    Sender sender;
    List<Recipient> to;
//    Recipient to;
    String subject;
    String htmlContent;
    Long templateId;
    Map<String,Object> params;
}
