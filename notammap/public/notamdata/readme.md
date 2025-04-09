# Notam Data

This folder should contain the most recent notams for each country in the json format produced by the notamextractor.

Available countries should be listed in `countries.json` containing an array of country names. For each listed name a json file with the exact same name should exist (replace spaces with underscores).

## Example

**countries.json**

```json
["Country", "Another Country"]
```

**notamdata folder contents**

```
notamdata/
  |
  +--countries.json
  |
  +--Country.json
  |
  +--Another_Country.json
```
