package com.ntt.common_lib.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RecoveryFallbackUsernameEvent {
    String userId;
    String username;
}
