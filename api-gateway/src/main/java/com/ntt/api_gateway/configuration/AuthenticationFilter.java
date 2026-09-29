package com.ntt.api_gateway.configuration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ntt.api_gateway.service.IdentityService;
import com.ntt.common_lib.dto.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PACKAGE, makeFinal = true)
public class AuthenticationFilter implements GlobalFilter, Ordered {
    IdentityService identityService;
    ObjectMapper mapper;

    @NonFinal
    String[] publicEndpoints = {
            "/identity/auth/.*", "/identity/users/registration",
            "/notification/email/send",
            "/file/media/download/.*",
            "/admin/login",
            "/admin/css/.*",
            "/admin/webjars/.*",
            "/admin/auth/.*",

            "/.*/v3/api-docs.*",
            "/.*/swagger-ui/.*",
            "/.*/swagger-ui.html"
    };

    @Value("${app.api-prefix}")
    @NonFinal
    String appApiPrefix;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Authentication Filter");
        if (isPublicEndpoint(exchange.getRequest())) {
            return chain.filter(exchange);
        }

        String token = null;

        List<String> authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (!CollectionUtils.isEmpty(authHeader)) {
            String bearerToken = authHeader.getFirst();
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                token = bearerToken.replace("Bearer ", "");
                log.info("token from header: " + token);
            }
        }

        if (token == null && exchange.getRequest().getCookies().containsKey("ADMIN_TOKEN")) {
            var cookie = exchange.getRequest().getCookies().getFirst("ADMIN_TOKEN");
            if (cookie != null) {
                token = cookie.getValue();
                log.info("token from cookie: " + token);
            }
        }

        if (token == null || token.isBlank()) {
            return unauthenticated(exchange.getResponse());
        }

        return identityService.introspect(token).flatMap(introspectResponse -> {
            if (introspectResponse.getResult().isValid()) {
                return chain.filter(exchange);
            }
            return unauthenticated(exchange.getResponse());
        }).onErrorResume(throwable -> unauthenticated(exchange.getResponse()));
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private boolean isPublicEndpoint(ServerHttpRequest request) {
        return Arrays.stream(publicEndpoints).anyMatch(endpoint -> request.getURI().getPath().matches(appApiPrefix + endpoint));
    }

    Mono<Void> unauthenticated(ServerHttpResponse response) {
        String body = null;
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(1401)
                .message("Unauthenticated").build();
        try {
            body = mapper.writeValueAsString(apiResponse);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }
}