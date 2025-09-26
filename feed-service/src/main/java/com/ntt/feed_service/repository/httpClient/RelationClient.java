package com.ntt.feed_service.repository.httpClient;

import com.ntt.common_lib.dto.ApiResponse;
//import com.ntt.feed_service.configuration.AuthenticationRequestInterceptor;
import com.ntt.feed_service.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name="relation-service",url = "${app.services.relation.url}",configuration = AuthenticationRequestInterceptor.class)
public interface RelationClient {

    @GetMapping("/followers/{userId}")
    ApiResponse<List<String>> getFollowers(@PathVariable String userId);
}
