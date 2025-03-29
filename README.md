# Notam Map

A moving map web app displaying formatted NOTAM data and airspace restrictions. Supports filtering.

## Project structure

**notamextractor**

Extracts notams from DINS (https://www.notams.faa.gov/dinsQueryWeb/), formats some of the data (notam text, coordinates in notams) for the frontend and exports them as json. Written in Java.

**notammap**

A web app which displays the extracted notams on a map. Written in TypeScript using React.

**opanaipproxy**

A proxy/caching server for OpenAIP (https://www.openaip.net/) map tiles, which contain aeronautical data like airspaces and airports. Using Nginx in a container.
