package com.ntt.post_service.repository.httpclient;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.post_service.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@FeignClient(name = "file-service", url = "${app.services.file.url}", configuration = AuthenticationRequestInterceptor.class)
public interface FileClient {
    @PostMapping(value = "/media/upload/{fileOwnerType}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<List<FileResponse>> uploadMedia(@RequestPart("files") MultipartFile[] files,
                                                @PathVariable("fileOwnerType") FileOwnerType fileOwnerType,
                                                @RequestParam(value = "referenceId", required = false) String referenceId);

    @GetMapping("/media/{referenceId}")
    ApiResponse<List<FileResponse>> getFilesByReferenceId(@PathVariable("referenceId") String referenceId,
                                                          @RequestParam(required = false) FileOwnerType type);
}