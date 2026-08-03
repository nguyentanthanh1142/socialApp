package com.ntt.profile_service.repository.httpclient;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.profile_service.configuration.AuthenticationRequestInterceptor;
import com.ntt.profile_service.dto.response.FileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@FeignClient(name = "file-service", url = "${app.services.file-service}",
        configuration = AuthenticationRequestInterceptor.class)
public interface FileClient {
    @PostMapping(value = "/media/upload/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<List<FileResponse>> uploadMediaAvatar(@RequestPart("file") MultipartFile[] file);


}
