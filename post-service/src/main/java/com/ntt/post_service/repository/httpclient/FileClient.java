package com.ntt.post_service.repository.httpclient;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.common_lib.dto.FileResponse;
import com.ntt.post_service.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@FeignClient(name = "file-service", url = "${app.services.file.url}", configuration = AuthenticationRequestInterceptor.class)
public interface FileClient {
    @PostMapping(value = "/media/upload/post", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<List<FileResponse>> uploadMediaPost(@RequestPart("files") MultipartFile[] file, @RequestParam("postId") String postId);
}
