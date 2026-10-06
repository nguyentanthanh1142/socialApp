package com.ntt.post_service.enitity;

import com.ntt.common_lib.enums.PostPrivacy;
import com.ntt.post_service.enums.PostStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(value="post")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Post {
    @MongoId
    String id;
    String userId;
    String content;
    Instant createDate;
    Instant modifiedDate;

    @Builder.Default
    Set<String> likes = new HashSet<>();

    Instant deletedAt;
    @Builder.Default
    PostStatus status = PostStatus.PUBLISHED;

    String deletedBy;
    @Builder.Default
    PostPrivacy privacy = PostPrivacy.PUBLIC;
}
