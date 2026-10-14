package com.ntt.common_web;

import feign.Response;
import feign.codec.ErrorDecoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FeignErrorDecoder implements ErrorDecoder {

    private static final Logger log = LoggerFactory.getLogger(FeignErrorDecoder.class);

    @Override
    public Exception decode(String methodKey, Response response) {
        log.warn("Feign call failed: {} -> HTTP {}", methodKey, response.status());
        return new ServiceCallException(response.status(), methodKey);
    }
}
