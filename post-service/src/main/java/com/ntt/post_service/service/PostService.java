package com.ntt.post_service.service;

import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.common_lib.event.PostCreatedEvent;
import com.ntt.post_service.dto.PageResponse;
import com.ntt.post_service.dto.request.PostRequest;
import com.ntt.post_service.dto.response.PostResponse;
import com.ntt.post_service.dto.response.PostStatsResponse;
import com.ntt.post_service.dto.response.UserProfileResponse;
import com.ntt.post_service.enitity.Post;
import com.ntt.post_service.exception.AppException;
import com.ntt.post_service.exception.ErrorCode;
import com.ntt.post_service.mapper.PostMapper;
import com.ntt.post_service.repository.PostRepository;
import com.ntt.post_service.repository.httpclient.FileClient;
import com.ntt.post_service.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PostService {
    PostRepository postRepository;
    PostMapper postMapper;
    ProfileClient profileClient;
    DateTimeFormatter dateTimeFormatter;
    FileClient fileClient;
    KafkaTemplate<String, PostCreatedEvent> kafkaTemplate;

    public PostResponse createPost(PostRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Post post = Post.builder()
                .userId(authentication.getName())
                .content(request.getContent())
                .createDate(Instant.now())
                .modifiedDate(Instant.now())
                .deleted(false)
                .build();
        post = postRepository.save(post);
        List<FileResponse> postImages = new ArrayList<>();
        if(request.getFiles() != null) {
            postImages = fileClient.uploadMedia(request.getFiles(), FileOwnerType.POST ,post.getId()).getResult();
        }
        PostCreatedEvent event = PostCreatedEvent.builder()
                .postId(post.getId())
                .userId(authentication.getName())
                .content(request.getContent())
                .createdAt(post.getCreateDate())
                .files(postImages)
                .build();

        kafkaTemplate.send("post-created", event);

        var response = postMapper.ToPostResponse(post);
        response.setFiles(postImages);
        return response;
    }
    public PageResponse<PostResponse> getMyPosts(int page,int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        UserProfileResponse userProfile = null;

        try{
            userProfile = profileClient.getProfile(userId).getResult();
            log.info("User profile : {}", userProfile);
        }catch(Exception e){
            log.error("Error fetching user profile: {}", e.getMessage());
        }
        Sort sort = Sort.by("createDate").descending();
        Pageable pageable = PageRequest.of(page - 1, size,sort);
        var pageData = postRepository.findAllByUserIdAndDeletedFalse(userId, pageable);

        String userName = userProfile != null ? userProfile.getUsername() : null ;
        var postList = pageData.stream().map(post -> {
            var postResponse = postMapper.ToPostResponse(post);
            postResponse.setCreated(dateTimeFormatter.format(post.getCreateDate()));
            postResponse.setUsername(userName);
            return postResponse;
        }).toList();

        return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .data(postList)
                .build();
    }

    public List<FileResponse> uploadPostImage(MultipartFile[] file, String postId){
        var response = fileClient.uploadMedia(file, FileOwnerType.POST, postId);
        return response.getResult();
    }

    public PostResponse getPost(String postId) {
        Post post = postRepository.getPostsByIdAndDeletedFalse(postId);
        if (post == null) {
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }
        return postMapper.ToPostResponse(post);
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public PageResponse<PostResponse> getPostsForAdmin(int page, int size, boolean includeDeleted) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by("createDate").descending());
        var pageData = includeDeleted
                ? postRepository.findAllByOrderByCreateDateDesc(pageable)
                : postRepository.findAllByDeletedFalse(pageable);

        var postList = pageData.stream().map(postMapper::ToPostResponse).toList();

        return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .data(postList)
                .build();
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public PostResponse softDeletePost(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (post.isDeleted()) {
            throw new AppException(ErrorCode.POST_ALREADY_DELETED);
        }

        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        post.setDeleted(true);
        post.setDeletedAt(Instant.now());
        post.setDeletedBy(adminId);
        post.setModifiedDate(Instant.now());
        return postMapper.ToPostResponse(postRepository.save(post));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public PostStatsResponse getPostStats() {
        long deleted = postRepository.countByDeletedTrue();
        long active = postRepository.countByDeletedFalse();
        return PostStatsResponse.builder()
                .totalPosts(deleted + active)
                .activePosts(active)
                .deletedPosts(deleted)
                .build();
    }

}
