package com.ntt.file_service.repository;

import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.file_service.entity.FileManagement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileManagementRepository extends MongoRepository<FileManagement, String> {

    List<FileManagement> findByReferenceIdAndOwnerType(String referenceId, FileOwnerType ownerType);
}
