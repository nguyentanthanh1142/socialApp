package com.ntt.file_service.repository;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.file_service.configuration.CloudinaryProperties;
import com.ntt.file_service.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.ntt.file_service.exception.AppException;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;
    private final CloudinaryProperties properties;

    public Map<String, Object> uploadFile(MultipartFile file, FileOwnerType ownerType) {
        try {
            String targetFolder = properties.getFolder() + "/" + ownerType.name().toLowerCase();

            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", targetFolder,
                    "resource_type", "auto"
            );

            return cloudinary.uploader().upload(file.getBytes(), uploadParams);
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    public void deleteFile(String publicId) {
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Deleted file from Cloudinary: {}, result: {}", publicId, result.get("result"));
        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary with publicId: {}", publicId, e);
        }
    }
}
