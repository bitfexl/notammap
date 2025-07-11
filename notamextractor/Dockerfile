FROM maven:3-eclipse-temurin-21 AS build-app
WORKDIR /build
COPY . .
RUN mvn package
RUN mv /build/target/notamextractor.jar /app.jar

# https://github.com/docker-library/docs/blob/master/eclipse-temurin/README.md#creating-a-jre-using-jlink
FROM eclipse-temurin:21 AS build-jre
WORKDIR /build
COPY --from=build-app /app.jar .
RUN $JAVA_HOME/bin/jlink \
         --add-modules $($JAVA_HOME/bin/jdeps --ignore-missing-deps --print-module-deps app.jar) \
         --strip-debug \
         --no-man-pages \
         --no-header-files \
         --compress=2 \
         --output /javaruntime

FROM debian:12-slim
WORKDIR /
RUN apt update -y && apt install ca-certificates -y
COPY --from=build-jre /javaruntime /javaruntime
COPY --from=build-app /app.jar .
CMD ["/javaruntime/bin/java", "-jar", "app.jar"]