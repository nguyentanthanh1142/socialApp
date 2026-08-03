package com.ntt.common_lib.dto;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EntityDTO {
    String id;
    String type;
    String contentPreview;
    String thumbnailUrl;
}
