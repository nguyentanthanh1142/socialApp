package com.ntt.notification_service.configuration;


import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "spring.notification.email")
@Data
public class EmailProperties {
    String url;
    String apikey;
    String provider;
    SenderProperties sender;
    Map<String, Long> templates;

    @Data
    public static class SenderProperties {
        String name;
        String email;
    }
}