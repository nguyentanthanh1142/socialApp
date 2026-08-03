package com.ntt.common_lib.dto;


import com.ntt.common_lib.enums.PostOwnerType;
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
    GroupDTO group; // null nếu ownerType = USER
    List<FileResponse> files;
    Instant createdAt;
}
