# Notam Map

A moving map web app displaying formatted NOTAM data and airspace restrictions. Supports filtering.

## Project structure

**notamextractor**

Extracts notams from DINS (https://www.notams.faa.gov/dinsQueryWeb/), formats some of the data (notam text, coordinates in notams) for the frontend and exports them as json. Written in Java.

**notammap**

A web app which displays the extracted notams on a map. Written in TypeScript using React.

**tmsproxy**

A tile map service proxy for satellite and Open AIP tiles.

## Install

The NOTAM Map is installed using podman quadlets which are found in the `systemd` directory alongside a systemd timer which schedules the notam extraction.

To install the NOTAM Map dependencies and sources on Fedora 42 the following install script can be used:

```shell
curl https://raw.githubusercontent.com/bitfexl/notammap/refs/heads/master/installscript | sh
```

After dependency and source code installation, the following config files have to be created:

- *tmsproxy/config/tmsconfig.json* tile service configuration for OpenAIP and Satellite images. See `tmsconfig.template.json` for details.

The installation can be completed by building the images and installing the quadlets using './install.sh'. The NOTAM Map webserver will be running on `8080` so that it can be proxied on port 80 with https for public access (see `caddy-production-setup`).

All the config files are copied to the images during build. To update the config and/or to the newest version run `./update.sh`.

The systemd services can be removed using `./remove.sh`.

The tiles take some time to show up after restart because the caddy webserver (located in notammap frontend) needs time to correctly identify the proxy as up. Browser cache may needs to be cleared.

## Administration scripts

Show generated quadlets systemd config:

```shell
/usr/lib/systemd/system-generators/podman-system-generator --dryrun
```

The following systemd services will be installed:

- *notammap-webserver.service* the main entry point, will start all the other required services. Runs a webserver at 8080.
- *notammap-notamextractor.service* the extraction service. Runs once when the webserver is started. Extracts data to the notamdata volume.
- *notammap-notamextractor.timer* schedules the extraction once a day.
- *notammap-tmsproxy.service* the tile map service proxy. Required by the webserver.
- *notammap-notamdata-volume.service* the notam data exchange volume between the notamextractor and webserver. Required by both.
- *notammap-network.service* the notammap default network. Required by the webserver and tmsproxy.