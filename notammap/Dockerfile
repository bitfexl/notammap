FROM node as build

WORKDIR /build
COPY package*.json .
RUN npm install

WORKDIR /clean
COPY . .
RUN git init && git clean -Xdf && mv ./* /build

WORKDIR /build

ARG OPENAIP_TILE_LAYER_URL
ARG SATELLITE_TILE_LAYER_URL
ARG INJECT_HEAD
ENV VITE_OPENAIP_TILE_LAYER_URL=$OPENAIP_TILE_LAYER_URL \
    VITE_SATELLITE_TILE_LAYER_URL=$SATELLITE_TILE_LAYER_URL \
    VITE_INJECT_HEAD=$INJECT_HEAD

RUN npm run build && mv dist /dist

FROM caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /dist/ /usr/share/caddy/