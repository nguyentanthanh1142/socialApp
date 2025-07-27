package com.ntt.file_service.mapper;

import com.ntt.file_service.dto.FileInfo;
import com.ntt.file_service.entity.FileManagement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FileManagementMapper {
    @Mapping(target="id", source = "name")
    FileManagement toFileManagement(FileInfo fileInfo);
}
