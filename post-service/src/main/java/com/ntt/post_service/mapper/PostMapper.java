package com.ntt.post_service.mapper;

import com.ntt.post_service.dto.response.PostResponse;
import com.ntt.post_service.enitity.Post;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostMapper {
    PostResponse ToPostResponse(Post post);
}
