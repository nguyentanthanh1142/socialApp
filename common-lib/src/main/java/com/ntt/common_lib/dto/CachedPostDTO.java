package com.ntt.common_lib.dto;


import com.ntt.common_lib.enums.PostOwnerType;
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
public class CachedPostDTO {
    String id;
    String content;
    PostOwnerType postsOwnerType; // USER | GROUP
    String ownerId;
    AuthorDTO author;
    GroupDTO group;
    List<FileResponse> files;
    Instant createdAt;
    PostPrivacy privacy;
}
