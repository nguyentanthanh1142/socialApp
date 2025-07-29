# Stage 1: build
FROM maven:3.9.8-amazoncorretto-21 AS build

ARG MODULE
WORKDIR /app
COPY pom.xml .
COPY common-lib ./common-lib
COPY ${MODULE} ./${MODULE}

RUN mvn install -N -DskipTests
RUN mvn -f common-lib/pom.xml clean install -DskipTests
RUN mvn -f ${MODULE}/pom.xml clean package -DskipTests


#Stage 2: create image
FROM amazoncorretto:21.0.4
ARG MODULE
WORKDIR /app

COPY --from=build /app/${MODULE}/target/${MODULE}-*.jar app.jar

# Command to run the application
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]