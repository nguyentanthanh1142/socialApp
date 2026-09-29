package com.ntt.post_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostStatsResponse {
    long totalPosts;
    long activePosts;
    long deletedPosts;
}
