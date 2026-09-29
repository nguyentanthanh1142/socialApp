package com.ntt.post_service.repository;

import com.ntt.post_service.enitity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface PostRepository extends MongoRepository<Post, String> {
    Page<Post> findAllByUserIdAndDeletedFalse(String userId, Pageable pageable);

    Page<Post> findAllByDeletedFalse(Pageable pageable);

    Page<Post> findAllByOrderByCreateDateDesc(Pageable pageable);

    Post getPostsByIdAndDeletedFalse(String postId);

    long countByDeletedTrue();

    long countByDeletedFalse();
}
