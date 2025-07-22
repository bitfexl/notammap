# Notammap frontend

This folder contains the frontend of the notammap.

The following tools and libraries have been used:

-   Node
-   TypeScript
-   React
-   Vite
-   TailwindCSS
-   Leaflet (https://leafletjs.com/)
-   Feather Icons (https://feathericons.com/)

Map tiles from:

-   OpenStreetMap
-   OpenAIP (https://www.openaip.net/)

## Design Notes

Normal element: rounded-md

Highlighted element: border-2 border-gray-700

Element over map: { boxShadow: "0 0 5px #374151" }

## Docker

**Build**

```
docker build -t notam-map .
```

Builds without config (e.g. tms url for openaip).

**Run (powershell)**

```
docker run -it --rm -p 8080:80 -v ${PWD}/public/notamdata:/usr/share/caddy/notamdata notam-map
```

## Development setup

- Create *.env.local* file just like *.env-template* with api keys set.
- Extract NOTAMS using notamextractor and place into *public/notamdata*.