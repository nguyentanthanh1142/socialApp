package com.ntt.post_service.repository;

import com.ntt.post_service.enitity.Post;
import com.ntt.post_service.enums.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface PostRepository extends MongoRepository<Post, String> {
    Page<Post> findAllByUserIdAndStatusNot(String userId, PostStatus status, Pageable pageable);
    Page<Post> findAllByStatusNot(PostStatus status, Pageable pageable);

    Page<Post> findAllByOrderByCreateDateDesc(Pageable pageable);

    Post getPostsByIdAndStatusNot(String postId, PostStatus status);

    long countByStatus(PostStatus status);

    long countByStatusNot(PostStatus status);
}
