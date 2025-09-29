podman build -t notammap/frontend-webserver \
    --build-arg OPENAIP_TILE_LAYER_URL=/tiles/openaip/{z}/{x}/{y} \
    --build-arg SATELLITE_TILE_LAYER_URL=/tiles/satellite/{z}/{x}/{y} \
    ./notammap

podman build -t notammap/notamextractor ./notamextractor

podman build -t notammap/meilisearch ./meilisearch

podman build -t notammap/tmsproxy ./tmsproxy