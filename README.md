# Notam Map

A moving map web app displaying formatted NOTAM data and airspace restrictions. Supports filtering.

## Project structure

**notamextractor**

Extracts notams from DINS (https://www.notams.faa.gov/dinsQueryWeb/), formats some of the data (notam text, coordinates in notams) for the frontend and exports them as json. Written in Java.

**notammap**

A web app which displays the extracted notams on a map. Written in TypeScript using React.

**opanaipproxy**

A proxy/caching server for OpenAIP (https://www.openaip.net/) map tiles, which contain aeronautical data like airspaces and airports. Using Nginx in a container.

## Install

To install the NOTAM Map server on Fedora 42 the following install script can be used:

```shell
curl https://raw.githubusercontent.com/bitfexl/notammap/refs/heads/master/installscript | sh
```

After installation, inside the notammap directory, only the following config files have to be provided:

- *config/tmsconfig/tmsconfig.json* tile service configuration for OpenAIP and Satellite images. See `tmsconfig.template.json` for details.

Restart containers using:

```shell
podman compose restart
```

The newly added tiles take some time to show up after restart because the caddy webserver (located in notammap frontend) needs time to correctly identify the proxy as up. Browser cache may needs to be cleared.

## Administration scripts

TODO: force update/rebuild

TODO: install cron job to run *podman compose start* after reboot