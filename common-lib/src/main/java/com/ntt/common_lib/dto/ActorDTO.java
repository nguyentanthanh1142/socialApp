package com.ntt.common_lib.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ActorDTO {
    String id;
    String name;
    String avatarUrl;
    String type;
}
