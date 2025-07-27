package com.ntt.relation_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class RelationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(RelationServiceApplication.class, args);
	}

}
