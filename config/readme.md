# Configuration Directory

This directory contains the buildtime and runtime configuration required by the docker compose app.
Some config files my contain secrets and thus cannot be added to version control.
Template files should exist in such cases.

- *tmsconfig/tmsconfig.json* contains the configuration for the tile map service proxy for OpenAIP and satellite tiles. Only required at runtime.
- *notammap/prebuildscript* contains shell commands sourced just before building the frontend. Useful to set optional environment variables for build, like *VITE_INJECT_HEAD* to inject an analytics script. Only required at buildtime.