#!/bin/bash

# ===========================
# TẠO NETWORK
# ===========================
docker network create app-network || true
docker network create kafka-net || true

# ===========================
# ZOOKEEPER
# ===========================
docker run -d --name zookeeper \
  --network kafka-net \
  -p 2181:2181 \
  -e ALLOW_ANONYMOUS_LOGIN=yes \
  bitnami/zookeeper:3.8

# ===========================
# KAFKA
# ===========================
docker run -d --name kafka \
  --network kafka-net \
  -p 9092:9092 \
  -p 9094:9094 \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181 \
  -e ALLOW_PLAINTEXT_LISTENER=yes \
  -e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT \
  -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,PLAINTEXT_HOST://:9094 \
  -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:9094 \
  -e KAFKA_CFG_INTER_BROKER_LISTENER_NAME=PLAINTEXT \
  bitnami/kafka:3.8.0

# ===========================
# KAFKA UI
# ===========================
docker run -d --name kafka-ui \
  --network kafka-net \
  -p 8089:8080 \
  -e KAFKA_CLUSTERS_0_NAME=local \
  -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092 \
  -e KAFKA_CLUSTERS_0_ZOOKEEPER=zookeeper:2181 \
  provectuslabs/kafka-ui:latest

# ===========================
# IDENTITY SERVICE
# ===========================
docker run -d --name identity-service \
  --network app-network \
  --network kafka-net \
  -p 8082:8080 \
  --env-file .env \
  nonono000/identity-service:latest

#docker network connect kafka-net identity-service
# ===========================
# PROFILE SERVICE
# ===========================
docker run -d --name profile-service \
  --network app-network \
  -p 8081:8080 \
  --env-file .env \
  nonono000/profile-service:latest

# ===========================
# FILE SERVICE
# ===========================
docker run -d --name file-service \
  --network app-network \
  -v ./uploads:/app/uploads \
  -p 8084:8080 \
  --env-file .env \
  nonono000/file-service:latest

# ===========================
# CHAT SERVICE
# ===========================
docker run -d --name chat-service \
  --network app-network \
  -p 8085:8080 \
  -p 8999:8999 \
  --env-file .env \
  nonono000/chat-service:latest

# ===========================
# POST SERVICE
# ===========================
docker run -d --name post-service \
  --network app-network \
  -p 8083:8080 \
  --env-file .env \
  nonono000/post-service:latest

# ===========================
# API GATEWAY
# ===========================
docker run -d --name api-gateway \
  --network app-network \
  -p 8888:8080 \
  --env-file .env \
  -e SPRING_PROFILES_ACTIVE=docker \
  nonono000/api-gateway:latest

# ===========================
# NGINX FRONTEND
# ===========================
docker run -d --name nginx-frontend \
  --network app-network \
  -p 3000:80 \
  --env-file .env \
  nonono000/nginx-frontend:latest