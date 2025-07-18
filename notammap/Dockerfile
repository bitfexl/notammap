FROM node as build
WORKDIR /build
COPY package*.json .
RUN npm install
WORKDIR /clean
COPY . .
RUN git init && git clean -Xdf && mv ./* /build
WORKDIR /build
ENV VITE_OPENAIP_TILE_LAYER_URL=/tiles/openaip/{z}/{x}/{y} \
    VITE_SATELLITE_TILE_LAYER_URL=/tiles/satellite/{z}/{x}/{y}
RUN npm run build && mv dist /dist

FROM caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /dist/ /usr/share/caddy/