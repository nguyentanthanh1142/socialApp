# Stage 1: Build
FROM maven:3.9.8-amazoncorretto-21 AS build

ARG MODULE=api-gateway
WORKDIR /app

# Copy parent pom và các module liên quan
COPY pom.xml ./pom.xml
COPY common-lib ./common-lib
COPY ${MODULE} ./${MODULE}

# Build cả parent để Maven biết cấu trúc
RUN mvn install -N -DskipTests

# Build common-lib trước
RUN mvn -f common-lib/pom.xml clean install -DskipTests

# Build module chính
RUN mvn -f ${MODULE}/pom.xml clean package -DskipTests


# Stage 2: Runtime
FROM amazoncorretto:21-alpine

WORKDIR /app

ARG MODULE=api-gateway
COPY --from=build /app/${MODULE}/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
