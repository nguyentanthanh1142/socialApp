package com.ntt.common_web;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class ForwardingAuthRequestInterceptor implements RequestInterceptor {

    private static final Logger log = LoggerFactory.getLogger(ForwardingAuthRequestInterceptor.class);

    private final ServiceTokenGenerator tokens;

    public ForwardingAuthRequestInterceptor(ServiceTokenGenerator tokens) {
        this.tokens = tokens;
    }

    @Override
    public void apply(RequestTemplate template) {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            String authHeader = attrs.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
            if (StringUtils.hasText(authHeader)) {
                template.header(HttpHeaders.AUTHORIZATION, authHeader);
                log.debug("Internal Feign {} {} -> auth source: forwarded-user-token", template.method(), template.url());
                return;
            }
        }
        template.header(HttpHeaders.AUTHORIZATION, "Bearer " + tokens.generate());
        log.debug("Internal Feign {} {} -> auth source: service-token", template.method(), template.url());
    }
}
