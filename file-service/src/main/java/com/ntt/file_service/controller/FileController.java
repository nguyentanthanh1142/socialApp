package com.ntt.file_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.file_service.dto.FileInfo;
import com.ntt.file_service.entity.FileManagement;
import com.ntt.file_service.service.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {
    FileService fileService;

    @PostMapping("/media/upload/avatar")
    ApiResponse<List<FileResponse>> uploadMediaAvatar(@RequestParam("file") MultipartFile[] file) throws IOException {
        return ApiResponse.<List<FileResponse>>builder()
                .result(fileService.uploadMedia(file, FileOwnerType.AVATAR))
                .build();
    }
    @PostMapping("/media/upload/post")
    ApiResponse<List<FileResponse>> uploadMediaPost(@RequestParam("files") MultipartFile[] file, @RequestParam("postId") String postId) throws IOException {
        return ApiResponse.<List<FileResponse>>builder()
                .result(fileService.uploadMedia(file,FileOwnerType.POST,postId))
                .build();
    }
    @PostMapping("/media/upload/message")
    ApiResponse<List<FileResponse>> uploadMediaMessage(@RequestParam("file") MultipartFile[] file) throws IOException {
        return ApiResponse.<List<FileResponse>>builder()
                .result(fileService.uploadMedia(file,FileOwnerType.MESSAGE))
                .build();
    }
//    @GetMapping("/media/download/{fileName}")
//    ResponseEntity<Resource> downloadMedia(@PathVariable("fileName") String fileName) throws IOException {
//        var fileData = fileService.download(fileName);
//        log.info("Downloading file: {}", fileName);
//        return ResponseEntity.<Resource>ok()
//                .header(HttpHeaders.CONTENT_TYPE, fileData.ContentType())
//                .body(fileData.resource());
//    }

    @GetMapping("/media/{fileId}")
    ApiResponse<FileInfo> getFileInfo(@PathVariable String fileId) {
        return ApiResponse.<FileInfo>builder()
                .result(fileService.getFileInfo(fileId))
                .build();
    }
}
