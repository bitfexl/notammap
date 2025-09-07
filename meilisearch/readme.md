# Meilisearch

This directory contains a docker file which will build a meilisearch container and import search data for locations (cities worldwide and towns in europe) and airports (worldwide). The data is imported at build time. Meilisearch keys are also fixed at build time.

## Collect data

Data is not collected at build time. Instead run the command below to update the data.

```
node ./dataCollection/index.js
```

## Build and run image

WARNING: All the meilisearch keys are always fixed at build time and saved to text files in the image.

**Dev image**

This image enables the meilisearch developer dashboard. The search and admin key are logged before startup.

```
podman build --target=dev -t meilisearch-locations .
```

**Normal image**

```
podman build -t meilisearch-locations .
```

**Run**

```
podman run -it --rm -p 7700:7700 meilisearch-locations
```

## Other code snippets

**random string**

```
< /dev/random tr -dc 'A-Za-z0-9' | head -c 32; echo
```

**jq query to transform overpass output**

```
jq '[.[] | {id: .id, name: .tags.name, "name:en": .tags["name:en"], _geo: {lat: .lat, lng: .lon}}]'
```