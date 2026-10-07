package com.ntt.identity_service.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.*;

import com.ntt.common_lib.event.UserCreationEvent;
import com.ntt.event.dto.NotificationEvent;
import com.ntt.identity_service.constant.PredefindRole;
import com.ntt.identity_service.dto.request.*;
import com.ntt.identity_service.dto.response.VerifyEmailResponse;
import com.ntt.identity_service.entity.Role;
import com.ntt.identity_service.repository.VerificationTokenRepository;
import com.ntt.identity_service.repository.httpClient.OutboundIdentityClient;
import com.ntt.identity_service.repository.httpClient.OutboundUserClient;
import com.ntt.identity_service.repository.httpClient.ProfileClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;
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
import com.ntt.identity_service.dto.response.AuthCheckResponse;
import com.ntt.identity_service.dto.response.IntrospectResponse;
import com.ntt.identity_service.dto.response.UserResponse;
import com.ntt.identity_service.entity.InvalidatedToken;
import com.ntt.identity_service.entity.User;
import com.ntt.identity_service.enums.UserStatus;
import com.ntt.identity_service.exception.AppException;
import com.ntt.identity_service.exception.ErrorCode;
import com.ntt.identity_service.repository.InvalidatedTokenRepository;
import com.ntt.identity_service.repository.UserRepository;
import com.ntt.identity_service.mapper.UserMapper;

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
    TokenService tokenService;
    UserService userService;
    VerificationTokenRepository verificationTokenRepository;
    UserMapper userMapper;
    KafkaTemplate<String, Object> kafkaTemplate;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String signerKey;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long validDuration;

    @NonFinal
    @Value("${jwt.refresh-duration}")
    protected long refreshDuration;

    @NonFinal
    @Value("${outbound.identity.client-id}")
    protected String outboundClientId;

    @NonFinal
    @Value("${outbound.identity.client-secret}")
    protected String outboundClientSecret;

    @NonFinal
    @Value("${outbound.identity.redirect-url}")
    protected String redirectUrl;

    @NonFinal
    @Value("${app.verify.url}")
    protected String verifyEmailUrl;

    protected static final String GRANT_TYPE = "authorization_code";

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;
        SignedJWT signedJWT = null;
        try {
            signedJWT = verifyToken(token, false);
        } catch (AppException e) {
            isValid = false;
        }

        String userId = null;
        if (isValid && signedJWT.getJWTClaimsSet() != null) {
            userId = signedJWT.getJWTClaimsSet().getSubject();
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .userId(userId)
                .build();
    }

    public AuthenticationResponse authenticated(AuthenticationRequest request) {

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        var user = userRepository
                .findByUsernameOrEmail(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (user.getStatus() == UserStatus.BANNED) {
            throw new AppException(ErrorCode.USER_BANNED);
        }

        if (!user.isEmailVerified()) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .isFirstLogin(user.isFirstLogin())
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();

            Instant expiration = signToken.getJWTClaimsSet().getExpirationTime().toInstant();
            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(Date.from(expiration)).build();

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
        var user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user);

        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Instant issueTime = signedJWT.getJWTClaimsSet().getIssueTime().toInstant();

        Instant expiryTime = isRefresh
                ? issueTime.plus(refreshDuration, ChronoUnit.SECONDS)
                : signedJWT.getJWTClaimsSet().getExpirationTime().toInstant();

        var verified = signedJWT.verify(verifier);
        if (!(verified && expiryTime.isAfter(Instant.now()))) {
            log.info("Token expired.");
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }
        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            log.info("Token invalidated JWTID: {}", signedJWT.getJWTClaimsSet().getJWTID());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return signedJWT;
    }

    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        Instant now = Instant.now();
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer("ntt.com")
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(validDuration, ChronoUnit.SECONDS)))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
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
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
                }
            });
        }
        return stringJoiner.toString();
    }

    public AuthenticationResponse outboundAuthentication(String code) {
        var response = outboundIdentityClient.exchangeToken(ExchangeTokenRequest.builder()
                .code(code)
                .clientId(outboundClientId)
                .clientSecret(outboundClientSecret)
                .grantType(GRANT_TYPE)
                .redirectUri(redirectUrl)
                .build());

        log.info("Outbound Authentication response: {}", response);

        var userInfo = outboundUserClient.exchangeToken("json", response.getAccessToken());
        log.info("User Info: {}", userInfo);

        User user = userRepository.findByEmail(userInfo.getEmail()).orElse(null);

        if (user == null) {
            Set<Role> roles = new HashSet<>();
            roles.add(Role.builder().name(PredefindRole.USER).build());

            String generatedUsername = userInfo.getEmail().split("@")[0];

            User newUser = User.builder()
                    .email(userInfo.getEmail())
                    .username(generatedUsername)
                    .emailVerified(true)
                    .isFirstLogin(true)
                    .roles(roles)
                    .status(UserStatus.ACTIVE)
                    .build();

            try {
                user = userRepository.saveAndFlush(newUser);

                try {
                    var profileResponse = profileClient.createProfile(ProfileCreationRequest.builder()
                            .userId(user.getId())
                            .email(userInfo.getEmail())
                            .firstname(userInfo.getGivenName())
                            .lastname(userInfo.getFamilyName())
                            .avatar(userInfo.getPicture())
                            .username(generatedUsername)
                            .build());
                    log.info("Profile created response: {}", profileResponse);
                } catch (Exception e) {
                    log.warn("Failed to create profile or profile already exists: {}", e.getMessage());
                }

            } catch (DataIntegrityViolationException e) {
                log.warn("Race condition hit for email {}, fetching existing user", userInfo.getEmail());
                user = userRepository.findByEmail(userInfo.getEmail())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            }
        }

        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .isFirstLogin(user.isFirstLogin())
                .build();
    }

    public VerifyEmailResponse verifyEmail(String token) {

        log.info("Verify Email: {}", token);
        var userId = tokenService.verifyToken(token);
        if (userId == null) throw new AppException(ErrorCode.TOKEN_INVALID);
        log.info("Verified userId successfully: {}", userId);
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.isEmailVerified()) {
            return VerifyEmailResponse.builder().verified(true).build();
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        tokenService.invalidToken(token);
        return VerifyEmailResponse.builder().verified(true).build();
    }


    public AuthCheckResponse checkAuth(String userId) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return AuthCheckResponse.builder()
                    .authenticated(false)
                    .isFirstLogin(false)
                    .build();
        }

        UserResponse userResponse = userMapper.toUserResponse(user);

        return AuthCheckResponse.builder()
                .authenticated(true)
                .isFirstLogin(user.isFirstLogin())
                .user(userResponse)
                .build();
    }

    public UserResponse createUser(UserCreationRequest request)
    {
        User user = userService.createUser(request);

        var token = tokenService.generateVerificationToken(user.getId());
        log.info("Verification token generated for userId: {}", user.getId());

//        sendVerificationKafkaEvent(user, token);
        sendUserCreationEvent(user);
        return userMapper.toUserResponse(user);
    }

    public void resendVerificationEmail(ResendVerificationRequest request){
        String email = request.getEmail();

        if(tokenService.hasResendCooldown(email)) {
            throw new AppException(ErrorCode.TOO_MANY_REQUESTS);
        }

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.isEmailVerified()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_VERIFIED);
        }

        var token = tokenService.generateVerificationToken(user.getId());

        tokenService.setResendCooldown(email);

        sendVerificationKafkaEvent(user, token);
    }

    private void sendVerificationKafkaEvent(User user, String token)  {

        String verifyLink = verifyEmailUrl + "?token=" + token;
        Map<String, Object> params = new HashMap<>();
        params.put("username", user.getUsername());
        params.put("confirmLink", verifyLink);
        params.put("year", Year.now().getValue());
        params.put("appName", "NTT social network");

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("EMAIL")
                .recipient(user.getEmail())
                .subject("Welcome!")
                .params(params)
                .templateCode("welcome_email")
                .build();

        kafkaTemplate.send("notification-delivery", notificationEvent);
    }

    private void sendUserCreationEvent(User user)
    {
        UserCreationEvent event = UserCreationEvent.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .build();
        kafkaTemplate.send("user-creation", event);
    }
}