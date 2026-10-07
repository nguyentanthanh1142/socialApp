package com.ntt.common_lib.event;

import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.enums.PostPrivacy;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostUpdatedEvent {
    String postId;
    String userId;
    String content;
    Instant createdAt;
    List<FileResponse> files;
    PostPrivacy privacy;
}
