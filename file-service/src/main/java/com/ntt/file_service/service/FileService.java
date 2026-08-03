package com.ntt.file_service.service;

import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.file_service.dto.FileInfo;
import com.ntt.file_service.entity.FileManagement;
import com.ntt.file_service.exception.AppException;
import com.ntt.file_service.exception.ErrorCode;
import com.ntt.file_service.mapper.FileManagementMapper;
import com.ntt.file_service.repository.CloudinaryService;
import com.ntt.file_service.repository.FileManagementRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileService {

    CloudinaryService cloudinaryService;
    FileManagementRepository fileManagementRepository;
    FileManagementMapper fileManagementMapper;
    KafkaTemplate<String,String> kafkaTemplate;

//    public List<FileResponse> uploadMedia(MultipartFile[] file, FileOwnerType ownerType) throws IOException {
//        String ownerId = SecurityContextHolder.getContext().getAuthentication().getName();
//        List<FileResponse> responses = new ArrayList<>();
//
//        for (MultipartFile multipartFile : file) {
//
//            Map<String, Object> uploadResult = cloudinaryService.uploadFile(multipartFile, ownerType);
//            String publicId = (String) uploadResult.get("public_id");
//            String secureUrl = (String) uploadResult.get("secure_url");
//
//
//            var fileInfo = fileRepository.store(multipartFile);
//            var fileManagement = fileManagementMapper.toFileManagement(fileInfo);
//            fileManagement.setOwnerId(ownerId);
//            fileManagement.setOwnerType(ownerType);
//            fileManagement = fileManagementRepository.save(fileManagement);
//            responses.add(FileResponse.builder()
//                    .url(fileInfo.getUrl())
//                    .originalName(multipartFile.getOriginalFilename())
//                    .build()
//            );
//        }
//        return responses;
//    }
public List<FileResponse> uploadMedia(MultipartFile[] files, FileOwnerType ownerType, String referenceId) {
    String ownerId = SecurityContextHolder.getContext().getAuthentication().getName();
    List<FileResponse> responses = new ArrayList<>();

    for (MultipartFile multipartFile : files) {
        String publicId = null;
        try {
            Map<String, Object> uploadResult = cloudinaryService.uploadFile(multipartFile, ownerType);
            publicId = (String) uploadResult.get("public_id");
            String secureUrl = (String) uploadResult.get("secure_url");

            FileInfo fileInfo = FileInfo.builder()
                    .path(publicId)
                    .url(secureUrl)
                    .contentType(multipartFile.getContentType())
                    .size(multipartFile.getSize())
                    .build();


            var fileManagement = fileManagementMapper.toFileManagement(fileInfo);
            fileManagement.setOwnerId(ownerId);
            fileManagement.setOwnerType(ownerType);

            if (referenceId != null && !referenceId.isEmpty()) {
                fileManagement.setReferenceId(referenceId);
            }

            fileManagement = fileManagementRepository.save(fileManagement);

            publishFileUploaded(fileManagement.getId(), ownerId);

            responses.add(FileResponse.builder()
                    .url(secureUrl)
                    .originalName(multipartFile.getOriginalFilename())
                    .build());
        } catch (Exception e) {
            log.error("Error uploading file: {}", multipartFile.getOriginalFilename(), e);
            if (publicId != null) {
                try {
                    cloudinaryService.deleteFile(publicId);
                    log.info("Rolled back file from Cloudinary successfully: {}", publicId);
                } catch (Exception deleteEx) {
                    log.error("Failed to rollback file from Cloudinary: {}", publicId, deleteEx);
                }
            }
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);

        }
    }
    return responses;
}

    public List<FileResponse> uploadMedia(MultipartFile[] files, FileOwnerType ownerType) {
        return uploadMedia(files, ownerType, null);
    }

    public void publishFileUploaded(String fileId, String ownerId) {
        String event = fileId + "," + ownerId;
        kafkaTemplate.send("file-uploaded-topic", event);
    }

    public void publishFileDeleted(String fileId) {
        kafkaTemplate.send("file-deleted-topic", fileId);
    }
    public FileInfo getFileInfo(String fileId) {
        FileManagement fileManagement = fileManagementRepository.findById(fileId)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        return FileInfo.builder()
                .name(fileManagement.getId())
                .contentType(fileManagement.getContentType())
                .size(fileManagement.getSize())
                .path(fileManagement.getPath())
                .url(fileManagement.getUrl())
                .build();
    }
}