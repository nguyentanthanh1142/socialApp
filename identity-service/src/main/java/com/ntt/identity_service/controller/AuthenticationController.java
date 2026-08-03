package com.ntt.identity_service.controller;

import java.io.IOException;
import java.text.ParseException;

import com.ntt.common_lib.dto.ApiResponse;
import com.ntt.identity_service.dto.response.VerifyEmailResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import com.nimbusds.jose.JOSEException;
import com.ntt.identity_service.dto.request.*;
import com.ntt.identity_service.dto.response.AuthenticationResponse;
import com.ntt.identity_service.dto.response.IntrospectResponse;
import com.ntt.identity_service.service.AuthenticationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @Value("${app.url.frontend:http://localhost:3000}")
    @NonFinal
    String frontendUrl;

    @PostMapping("/outbound/authentication")
    ApiResponse<AuthenticationResponse> outboundAuthenticationResponseApiResponse(
            @RequestParam("code") String code){
        var result = authenticationService.outboundAuthentication(code);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticationResponseApiResponse(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticated(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticationResponseApiResponse(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> authenticationResponseApiResponse(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @GetMapping("/verify")
    void verifyEmail(@RequestParam("token") String token, HttpServletResponse response) throws IOException {
        try{
            authenticationService.verifyEmail(token);
            response.sendRedirect(frontendUrl + "/login?status=success");

        } catch (Exception e) {
            response.sendRedirect(frontendUrl + "/login?status=error");
        }
    }
}
