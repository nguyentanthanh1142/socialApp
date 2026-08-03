package com.ntt.post_service.service;

import com.ntt.common_lib.dto.FileResponse;
import com.ntt.common_lib.event.PostCreatedEvent;
import com.ntt.post_service.dto.PageResponse;
import com.ntt.post_service.dto.request.PostRequest;
import com.ntt.post_service.dto.response.PostResponse;
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
                .build();
        post = postRepository.save(post);
        List<FileResponse> postImages = new ArrayList<>();
        if(request.getFiles() != null) {
            postImages = fileClient.uploadMediaPost(request.getFiles(), post.getId()).getResult();
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
        var pageData = postRepository.findAllByUserId(userId, pageable);

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

    public List<FileResponse> uploadPostImage(MultipartFile[] file, String postId) throws IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var response = fileClient.uploadMediaPost(file, postId);
        return response.getResult();
    }

    public PostResponse getPost(String postId) {

        Post post = null;
        post = postRepository.getPostsById(postId);

        return postMapper.ToPostResponse(post);
    }

}
