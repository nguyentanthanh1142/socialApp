package com.ntt.identity_service.configuration;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic notificationDelivery() {
        return TopicBuilder.name("notification-delivery")
                .partitions(3)
                .replicas(1)
                .build();
    }

}
