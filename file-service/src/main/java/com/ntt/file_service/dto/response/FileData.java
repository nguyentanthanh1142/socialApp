package com.ntt.file_service.dto.response;

import org.springframework.core.io.Resource;

public record FileData  (String ContentType, Resource resource){
}
