package com.ntt.feed_service.dto.response;

import com.ntt.common_lib.dto.FileResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    String id;
    String userId;
    String username;
    String content;
    String created;
    Instant createDate;
    Instant modifiedDate;
    List<FileResponse> files;
}
