package com.ntt.file_service.service;

import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.common_lib.enums.FileStatus;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileService {

    static String CLOUDINARY_PUBLIC_ID = "public_id";
    static String CLOUDINARY_SECURE_URL = "secure_url";
    static String TOPIC_FILE_UPLOADED = "file-uploaded-topic";
    static String TOPIC_FILE_DELETED = "file-deleted-topic";

    CloudinaryService cloudinaryService;
    FileManagementRepository fileManagementRepository;
    FileManagementMapper fileManagementMapper;
    KafkaTemplate<String, String> kafkaTemplate;

    public List<FileResponse> uploadMedia(MultipartFile[] files, FileOwnerType ownerType, String referenceId) {
        String ownerId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<FileResponse> responses = new ArrayList<>();

        for (MultipartFile multipartFile : files) {
            String publicId = null;
            try {
                Map<String, Object> uploadResult = cloudinaryService.uploadFile(multipartFile, ownerType);
                publicId = (String) uploadResult.get(CLOUDINARY_PUBLIC_ID);
                String secureUrl = (String) uploadResult.get(CLOUDINARY_SECURE_URL);

                FileInfo fileInfo = FileInfo.builder()
                        .path(publicId)
                        .url(secureUrl)
                        .contentType(multipartFile.getContentType())
                        .size(multipartFile.getSize())
                        .build();

                FileManagement fileManagement = fileManagementMapper.toFileManagement(fileInfo);
                fileManagement.setOwnerId(ownerId);
                fileManagement.setOwnerType(ownerType);

                if (referenceId != null && !referenceId.isEmpty()) {
                    fileManagement.setReferenceId(referenceId);
                }

                fileManagement = fileManagementRepository.save(fileManagement);

                publishFileUploaded(fileManagement.getId(), ownerId);

                responses.add(FileResponse.builder()
                        .fileId(fileManagement.getId())
                        .url(secureUrl)
                        .originalName(multipartFile.getOriginalFilename())
                        .fileSize(multipartFile.getSize())
                        .status(FileStatus.READY)
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

    public FileResponse uploadVideo(MultipartFile file) {
        List<FileResponse> responses = uploadMedia(new MultipartFile[]{file}, FileOwnerType.VIDEO, null);
        return responses.get(0);
    }

//    public List<FileResponse> uploadVideos(MultipartFile[] files, String title, String description) {
//        return uploadMedia(files, FileOwnerType.VIDEO, null);
//    }

    @Transactional
    public void deleteFile(String fileId) {
        FileManagement fileManagement = fileManagementRepository.findById(fileId)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        if (fileManagement.getPath() != null) {
            try {
                cloudinaryService.deleteFile(fileManagement.getPath());
                log.info("Deleted file from Cloudinary: {}", fileManagement.getPath());
            } catch (Exception e) {
                log.error("Failed to delete file from Cloudinary: {}", fileManagement.getPath(), e);
            }
        }

        fileManagementRepository.delete(fileManagement);
        publishFileDeleted(fileId);
        log.info("Successfully deleted file record in DB: {}", fileId);
    }

    public List<FileResponse> getFilesByReference(String referenceId, FileOwnerType type )
    {
        List<FileManagement> fileManagements = fileManagementRepository.findByReferenceIdAndOwnerType(referenceId, type);
        return fileManagements.stream().map(this::toFileRespone).collect(Collectors.toList());
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

    public void publishFileUploaded(String fileId, String ownerId) {
        String event = fileId + "," + ownerId;
        kafkaTemplate.send(TOPIC_FILE_UPLOADED, event);
    }

    public void publishFileDeleted(String fileId) {
        kafkaTemplate.send(TOPIC_FILE_DELETED, fileId);
    }

    private FileResponse toFileRespone(FileManagement fileManagement){
        return FileResponse.builder()
                .fileId(fileManagement.getId())
                .url(fileManagement.getUrl())
                .fileSize(fileManagement.getSize())
                .originalName(fileManagement.getOriginalName())
                .status(FileStatus.READY)
                .build();
    }
}