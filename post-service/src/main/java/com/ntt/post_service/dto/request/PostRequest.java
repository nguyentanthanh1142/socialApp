package com.ntt.post_service.dto.request;

import com.ntt.common_lib.enums.PostPrivacy;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostRequest {
    String content;
    MultipartFile[] files;

    @Builder.Default
    PostPrivacy privacy = PostPrivacy.PUBLIC;
}
