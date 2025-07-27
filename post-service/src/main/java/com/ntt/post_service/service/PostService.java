package com.ntt.post_service.service;

import com.ntt.post_service.dto.PageResponse;
import com.ntt.post_service.dto.request.PostRequest;
import com.ntt.post_service.dto.response.PostResponse;
import com.ntt.post_service.dto.response.UserProfileResponse;
import com.ntt.post_service.enitity.Post;
import com.ntt.post_service.mapper.PostMapper;
import com.ntt.post_service.repository.PostRepository;
import com.ntt.post_service.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.Instant;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PostService {
    PostRepository postRepository;
    PostMapper postMapper;
    ProfileClient profileClient;
    DateTimeFormatter dateTimeFormatter;


    public PostResponse createPost(PostRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Post post = Post.builder()
                .userId(authentication.getName())
                .content(request.getContent())
                .createDate(Instant.now())
                .modifiedDate(Instant.now())
                .build();
        post = postRepository.save(post);
        return postMapper.ToPostResponse(post);
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
}
