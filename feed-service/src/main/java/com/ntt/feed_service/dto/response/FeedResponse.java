package com.ntt.feed_service.dto.response;

import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.enums.PostAction;
import com.ntt.common_lib.enums.PostPrivacy;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedResponse {
    String postId;
    String userId;
    String avatarUrl;
    String name;
    String content;
    Instant createdAt;
    PostPrivacy postPrivacy;

    boolean liked;
    Long likeCount;
    boolean saved;
    boolean isRead = false;
    Double score;
    List<FileResponse> files;

    List<PostAction> actions;
}

