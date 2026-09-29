package com.ntt.file_service.controller;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.file_service.dto.FileInfo;
import com.ntt.file_service.service.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {
    FileService fileService;

//    @PostMapping("/media/upload/avatar")
//    ApiResponse<List<FileResponse>> uploadMediaAvatar(@RequestParam("file") MultipartFile[] file) {
//        return ApiResponse.<List<FileResponse>>builder()
//                .result(fileService.uploadMedia(file, FileOwnerType.AVATAR))
//                .build();

    /// /    }
//    @PostMapping("/media/upload/post")
//    ApiResponse<List<FileResponse>> uploadMediaPost(@RequestParam("files") MultipartFile[] file, @RequestParam("postId") String postId) {
//        return ApiResponse.<List<FileResponse>>builder()
//                .result(fileService.uploadMedia(file, FileOwnerType.POST, postId))
//                .build();
//    }
//    }
    @PostMapping("/media/upload/{fileOwnerType}")
    ApiResponse<List<FileResponse>> uploadMedia(@RequestParam("files") MultipartFile[] files,
                                                    @PathVariable FileOwnerType fileOwnerType,
                                                    @RequestParam(value = "referenceId", required = false) String referenceId) {
        return ApiResponse.<List<FileResponse>>builder()
                .result(fileService.uploadMedia(files, fileOwnerType, referenceId))
                .build();
    }

    @PostMapping("/media/upload/message")
    ApiResponse<List<FileResponse>> uploadMediaMessage(@RequestParam("file") MultipartFile[] file) {
        return ApiResponse.<List<FileResponse>>builder()
                .result(fileService.uploadMedia(file, FileOwnerType.MESSAGE))
                .build();
    }

    @DeleteMapping("/media/{fileId}")
    ApiResponse<Void> deleteFile(@PathVariable("fileId") String fileId) {
        fileService.deleteFile(fileId);
        return ApiResponse.<Void>builder()
                .message("File deleted successfully")
                .build();
    }
}
