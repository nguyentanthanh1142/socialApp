//package com.ntt.chat_service.service;
//
//import com.ntt.chat_service.dto.repuest.IntrospectRequest;
//import com.ntt.chat_service.dto.response.IntrospectResponse;
//import com.ntt.chat_service.repository.htppclient.IndentityClient;
//import feign.FeignException;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//import org.springframework.web.bind.annotation.RequestBody;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public class IdentityService {
//
//    IndentityClient indentityClient;
//
//    public IntrospectResponse introspect(@RequestBody IntrospectRequest request) {
//
//        try {
//            return indentityClient.authenticationResponseApiResponse(request).getResult();
//
//        } catch (FeignException e){
//            log.error(e.getMessage());
//            return IntrospectResponse.builder()
//                    .valid(false)
//                    .build();
//        }
//    }
//}
