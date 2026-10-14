package com.ntt.common_web;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

public class ServiceTokenGenerator {

    private final String serviceName;
    private final byte[] key;

    private String cachedToken;
    private Instant cachedExpiresAt;

    public ServiceTokenGenerator(String serviceName, String signingKey) {
        this.serviceName = serviceName;
        this.key = signingKey.getBytes(StandardCharsets.UTF_8);
    }

    public synchronized String generate() {
        Instant now = Instant.now();
        if (cachedToken != null && now.isBefore(cachedExpiresAt.minusSeconds(60))) {
            return cachedToken;
        }
        try {
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer("ntt.com")
                    .subject(serviceName)
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plusSeconds(300)))
                    .jwtID(UUID.randomUUID().toString())
                    .claim("scope", "ROLE_SERVICE")
                    .build();

            SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS512), claims);
            jwt.sign(new MACSigner(key));

            cachedToken = jwt.serialize();
            cachedExpiresAt = claims.getExpirationTime().toInstant();
            return cachedToken;
        } catch (JOSEException e) {
            throw new IllegalStateException("Cannot generate service token", e);
        }
    }
}
