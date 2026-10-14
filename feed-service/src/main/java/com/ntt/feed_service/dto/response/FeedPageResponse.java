package com.ntt.feed_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedPageResponse<T> {
    int currentPage;
    int totalPages;
    int pageSize;
    long totalElements;

    boolean hasNext;
    Double nextCheckpoint;
    @Builder.Default
    List<T> data = Collections.emptyList();
}
