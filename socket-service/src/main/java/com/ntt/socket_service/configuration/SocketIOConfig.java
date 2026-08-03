package com.ntt.socket_service.configuration;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig {
    @Bean
    public SocketIOServer socketIOClient() {

        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setPort(8999);
        config.setHostname("0.0.0.0");
        config.setOrigin("*");
        return new SocketIOServer(config);
    }
}
