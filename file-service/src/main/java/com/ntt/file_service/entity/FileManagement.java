package com.ntt.file_service.entity;

import com.ntt.common_lib.enums.FileOwnerType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(value = "file_management")
public class FileManagement {

    @MongoId
    String id;
    String ownerId;
    FileOwnerType ownerType;
    String referenceId;
    String contentType;
    long size;
    String md5Checksum;
    String path;
    String url;
}
