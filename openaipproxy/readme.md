# Open AIP Proxy

A proxy server for the open aip tile map service.

https://docs.openaip.net/?urls.primaryName=Tiles%20API

Tms layer: `https://api.tiles.openaip.net/api/data/openaip/z/x/y.png`

## Build and run

```
docker build -t tms .
docker run --rm -it -p 8080:80 -e OPENAIP_API_KEY=key_here tms
```
