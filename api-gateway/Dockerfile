# Stage 1: build
FROM maven:3.9.8-amazoncorretto-21 AS build

ARG MODULE
WORKDIR /app
COPY pom.xml .
COPY common-lib ./common-lib
COPY ${MODULE} ./${MODULE}

RUN mvn clean install -pl common-lib,${MODULE} -am -DskipTests

#Stage 2: create image
FROM amazoncorretto:21.0.4

WORKDIR /app
COPY --from=build /app/${MODULE}/target/${MODULE}-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]