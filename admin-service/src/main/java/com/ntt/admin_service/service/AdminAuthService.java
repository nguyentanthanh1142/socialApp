package com.ntt.admin_service.service;

import com.nimbusds.jwt.SignedJWT;
import com.ntt.admin_service.dto.request.AuthenticationRequest;
import com.ntt.admin_service.dto.response.AuthenticationResponse;
import com.ntt.admin_service.exception.AppException;
import com.ntt.admin_service.exception.ErrorCode;
import com.ntt.admin_service.repository.httpclient.IdentityClient;
import com.ntt.common_lib.dto.ApiResponse;

import feign.FeignException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminAuthService {

    IdentityClient identityClient;

    public AuthenticationResponse login(String username, String password) {
        try {
            ApiResponse<AuthenticationResponse> response = identityClient.login(
                    AuthenticationRequest.builder().username(username).password(password).build());

            AuthenticationResponse auth = response.getResult();
            if (auth == null || !auth.isAuthenticated() || auth.getToken() == null) {
                throw new AppException(ErrorCode.LOGIN_FAILED);
            }

            if (!hasAdminRole(auth.getToken())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            return auth;
        } catch (AppException e) {
            throw e;
        } catch (FeignException e) {
            log.error("Login failed via identity-service: {}", e.getMessage());
            throw new AppException(ErrorCode.LOGIN_FAILED);
        } catch (Exception e) {
            throw new AppException(ErrorCode.LOGIN_FAILED);
        }
    }

    public boolean validateToken(String token)
    {
        try{
            SignedJWT jwt = SignedJWT.parse(token);

            if (jwt.getJWTClaimsSet().getExpirationTime() != null &&
                    jwt.getJWTClaimsSet().getExpirationTime().before(new java.util.Date())) {
                return false;
            }
            return hasAdminRole(token);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean hasAdminRole(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            Object scope = jwt.getJWTClaimsSet().getClaim("scope");
            if (scope == null) {
                return false;
            }
            return scope.toString().contains("ROLE_ADMIN");
        } catch (Exception e) {
            return false;
        }
    }


}
