package com.ntt.feed_service.configuration;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
@Log4j2
public class AuthenticationRequestInterceptor implements RequestInterceptor {

    @Autowired
    private ServiceTokenGenerator serviceTokenGenerator;

    private String serviceToken;

    @Override
    public void apply(RequestTemplate requestTemplate) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            var authHeader = attributes.getRequest().getHeader("Authorization");
            log.info("authHeader from HTTP: {}", authHeader);
            if (StringUtils.hasText(authHeader)) {
                requestTemplate.header("Authorization", authHeader);
                return;
            }
        }
        serviceToken = serviceTokenGenerator.generateServiceToken();
        log.info("authHeader from SERVICE_TOKEN: {}", serviceToken);
            requestTemplate.header("Authorization", "Bearer " + serviceToken);
    }
}
