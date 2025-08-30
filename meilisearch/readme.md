Random String

```
< /dev/random tr -dc 'A-Za-z0-9' | head -c 32; echo
```

jq query to transform overpass output:

```
jq '[.[] | {id: .id, name: .tags.name, "name:en": .tags["name:en"], _geo: {lat: .lat, lng: .lon}}]'
```