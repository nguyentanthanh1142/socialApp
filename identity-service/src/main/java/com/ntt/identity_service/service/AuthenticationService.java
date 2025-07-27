package com.ntt.identity_service.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import com.ntt.identity_service.constant.PredefindRole;
import com.ntt.identity_service.dto.request.*;
import com.ntt.identity_service.entity.Role;
import com.ntt.identity_service.repository.httpClient.OutboundIdentityClient;
import com.ntt.identity_service.repository.httpClient.OutboundUserClient;
import com.ntt.identity_service.repository.httpClient.ProfileClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.ntt.identity_service.dto.response.AuthenticationResponse;
import com.ntt.identity_service.dto.response.IntrospectResponse;
import com.ntt.identity_service.entity.InvalidatedToken;
import com.ntt.identity_service.entity.User;
import com.ntt.identity_service.exception.AppException;
import com.ntt.identity_service.exception.ErrorCode;
import com.ntt.identity_service.repository.InvalidatedTokenRepository;
import com.ntt.identity_service.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    OutboundIdentityClient outboundIdentityClient;
    OutboundUserClient outboundUserClient;
    ProfileClient profileClient;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refresh-duration}")
    protected long REFRESH_DURATION;
    @NonFinal
    @Value("${outbound.identity.client-id}")
    protected  String OUTBOUND_CLIENT_ID;
    @NonFinal
    @Value("${outbound.identity.client-secret}")
    protected  String OUTBOUND_CLIENT_SECRET;
    @NonFinal
    @Value("${outbound.identity.redirect-url}")
    protected  String REDIRECT_URL;
    @NonFinal
    protected  final String GRANT_TYPE = "authorization_code";


    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;
        SignedJWT signedJWT = null;
        try {
            signedJWT = verifyToken(token, false);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .userId(Objects.isNull(signedJWT.getJWTClaimsSet().getSubject())?
                        null : signedJWT.getJWTClaimsSet().getSubject())
                .build();
    }

    public AuthenticationResponse authenticated(AuthenticationRequest request) {
        log.info(SIGNER_KEY);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        var user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var token = generateToken(user);
        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {

        try {
            var signToken = verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiration = signToken.getJWTClaimsSet().getExpirationTime();
            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiration).build();

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException e) {
            log.info("Token already expired");
        }
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {

        var signJWT = verifyToken(request.getToken(), true);

        var jit = signJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

        invalidatedTokenRepository.save(invalidatedToken);

        var username = signJWT.getJWTClaimsSet().getSubject();
        var user =
                userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user);

        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = isRefresh
                ? new Date(signedJWT
                        .getJWTClaimsSet()
                        .getIssueTime()
                        .toInstant()
                        .plus(REFRESH_DURATION, ChronoUnit.SECONDS)
                        .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);
        if (!(verified && expiryTime.after(new Date()))) {
            log.info("Da het han.");
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            log.info("Da ton tai JWID" + signedJWT.getJWTClaimsSet().getJWTID().toString());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return signedJWT;
    }

    private String generateToken(User user) {

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer("ntt.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("JWT serialization failed", e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions())) {
                    role.getPermissions().forEach(permission -> {
                        stringJoiner.add(permission.getName());
                    });
                }
            });
        }
        return stringJoiner.toString();
    }

    public AuthenticationResponse outboundAuthentication(String code) {
        var response = outboundIdentityClient.exchangeToken( ExchangeTokenRequest.builder()
                .code(code)
                .clientId(OUTBOUND_CLIENT_ID)
                .clientSecret(OUTBOUND_CLIENT_SECRET)
                .grantType(GRANT_TYPE)
                .redirectUri(REDIRECT_URL)
                .build());

        log.info("Outbound Authentication response: " + response);

        var userInfo = outboundUserClient.exchangeToken("json", response.getAccessToken());
        log.info("User Info: " + userInfo);

        Set<Role> roles = new HashSet<>();
        roles.add(Role.builder().name(PredefindRole.USER).build());

        var user = userRepository
                .findByUsername(userInfo.getEmail())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username(userInfo.getEmail())
                            .firstname(userInfo.getGivenName())
                            .lastname(userInfo.getFamilyName())
                            .roles(roles)
                            .build();
                    return userRepository.save(newUser);
                });
        user = userRepository.save(user);


        var profileResponse = profileClient.createProfile(ProfileCreationRequest.builder()
                        .email(userInfo.getEmail())
                        .firstname(userInfo.getGivenName())
                        .lastname(userInfo.getFamilyName())
                        .userId(user.getId())
                        .avatar(userInfo.getPicture())
                        .build() );
        log.info(profileResponse.toString());
        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true).build();
    }
}
