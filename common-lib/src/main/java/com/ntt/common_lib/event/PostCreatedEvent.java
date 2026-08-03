package com.ntt.common_lib.event;

import com.ntt.common_lib.dto.FileResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostCreatedEvent {
    String postId;
    String userId;
    String content;
    Instant createdAt;
    List<FileResponse> files;

}
