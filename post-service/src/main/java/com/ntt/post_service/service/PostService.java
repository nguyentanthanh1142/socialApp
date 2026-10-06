package com.ntt.post_service.service;

import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.enums.FileOwnerType;
import com.ntt.common_lib.enums.PostAction;
import com.ntt.common_lib.enums.PostPrivacy;
import com.ntt.common_lib.event.PostCreatedEvent;
import com.ntt.post_service.dto.PageResponse;
import com.ntt.post_service.dto.request.PostRequest;
import com.ntt.post_service.dto.request.PostUpdateRequest;
import com.ntt.post_service.dto.response.PostResponse;
import com.ntt.post_service.dto.response.PostStatsResponse;
import com.ntt.post_service.dto.response.UserProfileResponse;
import com.ntt.post_service.enitity.Post;
import com.ntt.post_service.enums.PostStatus;
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
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
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
    LikeService likeService;
    RedisTemplate<String, Object> redisTemplate;

    public PostResponse createPost(PostRequest request) {

        String userId = getCurrentUserId();
        Post post = Post.builder()
                .userId(userId)
                .content(request.getContent())
                .createDate(Instant.now())
                .modifiedDate(Instant.now())
                .privacy(request.getPrivacy() != null ? request.getPrivacy() : PostPrivacy.PUBLIC)
                .build();
        post = postRepository.save(post);

        List<FileResponse> postImages = new ArrayList<>();
        if (request.getFiles() != null) {
            postImages = fileClient.uploadMedia(request.getFiles(), FileOwnerType.POST, post.getId()).getResult();
        }

        PostCreatedEvent event = PostCreatedEvent.builder()
                .postId(post.getId())
                .userId(userId)
                .content(request.getContent())
                .createdAt(post.getCreateDate())
                .files(postImages)
                .build();

        kafkaTemplate.send("post-created", event);

        var response = postMapper.ToPostResponse(post);
        response.setFiles(postImages);
        response.setLiked(false);
        response.setLikeCount(0L);
        response.setSaved(false);
        return response;
    }

    public PageResponse<PostResponse> getMyPosts(int page, int size) {
        String userId = getCurrentUserId();
        UserProfileResponse userProfile = null;

        try {
            userProfile = profileClient.getProfile(userId).getResult();
            log.info("User profile : {}", userProfile);
        } catch (Exception e) {
            log.error("Error fetching user profile: {}", e.getMessage());
        }
        Sort sort = Sort.by("createDate").descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = postRepository.findAllByUserIdAndStatusNot(userId, PostStatus.DELETED,pageable);

        String userName = userProfile != null ? userProfile.getUsername() : null;

        var postList = pageData.stream().map(post -> {
            var postResponse = postMapper.ToPostResponse(post);
            postResponse.setCreated(dateTimeFormatter.format(post.getCreateDate()));
            postResponse.setUsername(userName);

            postResponse.setLikeCount(getLikeCountFromRedis(post.getId()));
            postResponse.setLiked(isUserLikedFromRedis(post.getId(), userId));
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

    @Transactional
    public PostResponse updatePost(PostUpdateRequest request)
    {
        String userId = getCurrentUserId();
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (!post.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getPrivacy() != null) {
            post.setPrivacy(request.getPrivacy());
        }
        List<FileResponse> postImages = new ArrayList<>();
        if (request.getFiles() != null && request.getFiles().length > 0) {
            postImages = fileClient.uploadMedia(request.getFiles(), FileOwnerType.POST, post.getId()).getResult();
        }

        var response = postMapper.ToPostResponse(post);
        response.setFiles(postImages);
        response.setLikeCount(getLikeCountFromRedis(post.getId()));
        response.setLiked(isUserLikedFromRedis(post.getId(), userId));
        return response;
    }

    @Transactional
    public void deletePost(String postId) {
        String userId = getCurrentUserId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (!post.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (post.getStatus().equals(PostStatus.DELETED)) {
            throw new AppException(ErrorCode.POST_ALREADY_DELETED);
        }

        post.setStatus(PostStatus.DELETED);
        post.setDeletedAt(Instant.now());
        post.setDeletedBy(userId);
        post.setModifiedDate(Instant.now());

        postRepository.save(post);
    }

    public PostResponse getPost(String postId) {
        Post post = postRepository.getPostsByIdAndStatusNot(postId, PostStatus.DELETED);
        if (post == null) {
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }

        String userId = getCurrentUserId();

        if (post.getPrivacy().equals(PostPrivacy.PRIVATE) && !post.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }

        List<FileResponse> postImages = new ArrayList<>();
        try {
            postImages = fileClient.getFilesByReferenceId(postId, FileOwnerType.POST).getResult();
        } catch (Exception e) {
            log.error("Failed to fetch files for postId={}: {}", postId, e.getMessage());
        }

        boolean isOwner = post.getUserId().equals(userId);
        boolean isLiked = isUserLikedFromRedis(postId, userId);
        List<PostAction> actions = availableActions(isOwner);

        PostResponse postResponse = postMapper.ToPostResponse(post);
        postResponse.setActions(actions);
        postResponse.setLiked(isLiked);
        postResponse.setLikeCount(getLikeCountFromRedis(postId));
        postResponse.setSaved(false);
        postResponse.setFiles(postImages);
        return postResponse;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<PostResponse> getPostsForAdmin(int page, int size, boolean includeDeleted) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by("createDate").descending());
        var pageData = includeDeleted
                ? postRepository.findAllByOrderByCreateDateDesc(pageable)
                : postRepository.findAllByStatusNot(PostStatus.DELETED, pageable);

        var postList = pageData.stream().map(postMapper::ToPostResponse).toList();

        return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .data(postList)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public PostResponse softDeletePost(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (post.getStatus().equals(PostStatus.DELETED)) {
            throw new AppException(ErrorCode.POST_ALREADY_DELETED);
        }

        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        post.setStatus(PostStatus.DELETED);
        post.setDeletedAt(Instant.now());
        post.setDeletedBy(adminId);
        post.setModifiedDate(Instant.now());
        return postMapper.ToPostResponse(postRepository.save(post));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PostStatsResponse getPostStats() {
        long deleted = postRepository.countByStatus(PostStatus.DELETED);
        long active = postRepository.countByStatusNot(PostStatus.DELETED);
        return PostStatsResponse.builder()
                .totalPosts(deleted + active)
                .activePosts(active)
                .deletedPosts(deleted)
                .build();
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private List<PostAction> availableActions(boolean isOwner) {
        List<PostAction> actions = new ArrayList<>();
        if (isOwner) {
            actions.add(PostAction.EDIT);
            actions.add(PostAction.DELETE);
            actions.add(PostAction.HIDE);
        } else {
            actions.add(PostAction.REPORT);
            actions.add(PostAction.SAVE);
        }
        actions.add(PostAction.SHARE);

        return actions;
    }

    private Long getLikeCountFromRedis(String postId) {
        return likeService.getLikeCount(postId);
    }

    private boolean isUserLikedFromRedis(String postId, String userId) {
        Boolean liked = redisTemplate.opsForSet().isMember("post:likes:" + postId, userId);
        return Boolean.TRUE.equals(liked);
    }
}
