package com.ntt.feed_service.configuration;


import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class ServiceTokenGenerator {

    @Value("${jwt.signerKey}")
    private String signerKey;

    private String cachedToken;
    private Instant cachedExpiresAt;

    public String generateServiceToken() {
        try {
            Instant now = Instant.now();

            if (cachedToken != null && cachedExpiresAt != null && now.isBefore(cachedExpiresAt.minusSeconds(60))) {
                return cachedToken;
            }

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer("ntt.com")
                    .subject("feed-service")
                    .audience("relation-service")
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plusSeconds(300))) // token 1h
                    .jwtID(UUID.randomUUID().toString())
                    .claim("scope", "ROLE_SERVICE")
                    .build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claims
            );

            signedJWT.sign(new MACSigner(signerKey.getBytes()));

            cachedToken = signedJWT.serialize();
            cachedExpiresAt = claims.getExpirationTime().toInstant();
            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Cannot generate service token", e);
        }
    }

}
