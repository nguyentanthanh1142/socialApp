package com.ntt.file_service.service;

import com.ntt.file_service.dto.response.FileData;
import com.ntt.file_service.dto.response.FileResponse;
import com.ntt.file_service.entity.FileManagement;
import com.ntt.file_service.exception.AppException;
import com.ntt.file_service.exception.ErrorCode;
import com.ntt.file_service.mapper.FileManagementMapper;
import com.ntt.file_service.repository.FileManagementRepository;
import com.ntt.file_service.repository.FileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileService {
    FileRepository fileRepository;
    FileManagementRepository fileManagementRepository;
    FileManagementMapper fileManagementMapper;

    public FileResponse uploadMedia(MultipartFile file) throws IOException {
        String ownerId = SecurityContextHolder.getContext().getAuthentication().getName();

        var fileInfo = fileRepository.store(file);

        var fileManagement = fileManagementMapper.toFileManagement(fileInfo);
        fileManagement.setOwnerId(ownerId);
        fileManagement = fileManagementRepository.save(fileManagement);
        return  FileResponse.builder()
                .url(fileInfo.getUrl())
                .originalName(file.getOriginalFilename())
                .build();
    }
    public FileData download(String fileName) throws IOException {

        var fileManagement = fileManagementRepository.findById(fileName)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        var fileData = fileRepository.getResource(fileManagement);
        return new FileData(fileManagement.getContentType(), fileData);

    }
}
