package com.ntt.profile_service.configuration;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.log4j.Log4j2;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Log4j2
public class AuthenticationRequestInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate requestTemplate) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        var authHeader = attributes.getRequest().getHeader("Authorization");
        log.info("authHeader: " + authHeader);
        if(StringUtils.hasText(authHeader)) {
            requestTemplate.header("Authorization", authHeader);
        }


    }
}
