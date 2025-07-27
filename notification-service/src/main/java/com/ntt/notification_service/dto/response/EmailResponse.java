package com.ntt.notification_service.dto.response;

import com.ntt.notification_service.dto.Recipient;
import com.ntt.notification_service.dto.Sender;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailResponse {
    String messageId;
}
