package com.ntt.common_web;

import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;


public class InternalFeignConfiguration {

    private static final Logger log = LoggerFactory.getLogger(InternalFeignConfiguration.class);

    @Bean
    public RequestInterceptor internalAuthInterceptor(ServiceTokenGenerator commonServiceTokenGenerator) {
        log.info("common-web: internal Feign auth interceptor ENABLED for a client");
        return new ForwardingAuthRequestInterceptor(commonServiceTokenGenerator);
    }

    @Bean
    public ErrorDecoder internalErrorDecoder() {
        log.info("common-web: internal Feign error decoder ENABLED for a client");
        return new FeignErrorDecoder();
    }
}
