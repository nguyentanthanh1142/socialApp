package com.ntt.file_service.repository;

import com.ntt.file_service.dto.FileInfo;
import com.ntt.file_service.entity.FileManagement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Repository;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Repository
public class FileRepository {

    @Value("${app.file.download-prefix}")
    String urlPrefix;

    @Value("${app.file.storage-dir}")
    String storageDir;

    public FileInfo store(MultipartFile file) throws IOException {

    Path folder = Paths.get(storageDir);
    String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
    String fillename = Objects.isNull(fileExtension)
            ?  UUID.randomUUID().toString()
            : UUID.randomUUID().toString() +"." + fileExtension;
    Path filePath = folder.resolve(fillename).normalize().toAbsolutePath();
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return FileInfo.builder()
                .name(fillename)
                .contentType(file.getContentType())
                .size(file.getSize())
                .md5Checksum(DigestUtils.md5DigestAsHex(file.getInputStream()))
                .path(filePath.toString())
                .url(urlPrefix + fillename)
                .build();
    }

    public Resource getResource(FileManagement fileManagement) throws IOException {
        var data = Files.readAllBytes(Path.of(fileManagement.getPath()));
        return new ByteArrayResource(data);
    }
}
