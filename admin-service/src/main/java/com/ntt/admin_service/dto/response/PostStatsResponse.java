package com.ntt.admin_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostStatsResponse {
    long totalPosts;
    long activePosts;
    long deletedPosts;
}
