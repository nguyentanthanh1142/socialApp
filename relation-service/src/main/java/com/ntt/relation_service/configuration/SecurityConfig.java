package com.ntt.relation_service.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_ENDPOINTS = {
            "/internal/users", "/internal/users/**",
    };

    private static final String[] swaggerEndpoints = {
        "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html"
    };

    @Value("${jwt.signerKey}")
    private String signerKey;
    private final CustomerJwtDecoder customerJwtDecoder;

    public SecurityConfig(CustomerJwtDecoder customerJwtDecoder) {
        this.customerJwtDecoder = customerJwtDecoder;
    }
    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec serviceKey  = new SecretKeySpec(signerKey.getBytes(), "HmacSHA256");
        JwtDecoder serviceDecoder =  NimbusJwtDecoder.withSecretKey(serviceKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();


        SecretKeySpec userKey = new SecretKeySpec(signerKey.getBytes(), "HmacSHA512");
        JwtDecoder userDecoder =  NimbusJwtDecoder.withSecretKey(userKey)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();


        return token -> {
            try {
                // Thử decode service token
                return serviceDecoder.decode(token);
            } catch (Exception ex1) {
                // Nếu fail, thử decode user token
                return userDecoder.decode(token);
            }
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {

        httpSecurity
//                .cors().and()
                .authorizeHttpRequests(request -> request
                    .requestMatchers(swaggerEndpoints).permitAll()
                    .anyRequest().authenticated());

        httpSecurity.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwtConfigurer -> jwtConfigurer
                        .decoder(jwtDecoder())
                        .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint()));

        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        return httpSecurity.build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix(""); // bỏ ROLE_

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {


            Collection<GrantedAuthority> authorities = new ArrayList<>();

            // scope từ token
            Object scopeObj = jwt.getClaims().get("scope");
            if (scopeObj instanceof String scopeStr) {
                for (String s : scopeStr.split(" ")) {
                    if(!s.isBlank())
                    {
                        authorities.add(new SimpleGrantedAuthority(s));
                    }
                }
            } else if (scopeObj instanceof List<?> scopeList) {
                scopeList.forEach(s -> {
                    if(s != null && !s.toString().isBlank()) {
                        authorities.add(new SimpleGrantedAuthority(s.toString()));
                    }
                });
            }

            authorities.addAll(jwtGrantedAuthoritiesConverter.convert(jwt));

            return authorities;
        });
        return converter;
    }
}
