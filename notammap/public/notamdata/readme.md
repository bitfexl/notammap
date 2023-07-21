# Notam Data

This folder should contain the most recent notams for each country in json format.

Available countries should be listed in `countries.json` countaining an array of country names. For each listed name a json file with the exact same name should exist (replace spaces with underscores).

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

The notam json files should have the format as produced by the notamextractor. See: https://github.com/bitfexl/notamextractor.
