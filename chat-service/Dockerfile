# syntax=docker/dockerfile:1
# =====================================================================
# Stage 1: Build application
# =====================================================================
FROM maven:3.9.8-amazoncorretto-21 AS build

ARG MODULE
WORKDIR /app

# 1. Copy POM files trước để cache dependency layer
COPY pom.xml .
COPY common-lib/pom.xml ./common-lib/
COPY ${MODULE}/pom.xml ./${MODULE}/

# 2. Pre-fetch dependencies (Giai đoạn này sẽ được Docker CACHE nếu không đổi pom.xml)
# Sử dụng Cache Mount của BuildKit để giữ lại thư mục .m2 giữa các lần build
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B -pl common-lib,${MODULE} -am || true

# 3. Copy source code sau cùng
COPY common-lib ./common-lib
COPY ${MODULE} ./${MODULE}

# 4. Build package (Tận dụng lại cache .m2 đã download)
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests -pl ${MODULE} -am

# =====================================================================
# Stage 2: Runtime image
# =====================================================================
FROM amazoncorretto:21-alpine

WORKDIR /app

# Cài đặt curl để phục vụ Healthcheck cho Docker Compose
RUN apk add --no-cache curl

ARG MODULE
# Copy file JAR đã build xong
COPY --from=build /app/${MODULE}/target/*.jar app.jar

# Biến môi trường mặc định (Có thể ghi đè từ Compose)
ENV JAVA_OPTS="-Xms256m -Xmx400m -XX:+UseG1GC"

EXPOSE 8080

# Chạy app kết hợp JAVA_OPTS khống chế RAM
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]