package com.ntt.common_lib.dto;


import com.ntt.common_lib.enums.FileStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileResponse {
    String fileId;
    String originalName;
    String url;
    Long fileSize;
    FileStatus status;

}