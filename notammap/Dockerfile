FROM node as build
WORKDIR /build
COPY package*.json .
RUN npm install
WORKDIR /clean
COPY . .
RUN git init && git clean -Xdf && mv ./* /build && cd /build && npm run build && mv dist /dist

FROM httpd
COPY --from=build /dist/ /usr/local/apache2/htdocs/