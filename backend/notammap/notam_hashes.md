Different types of hashes and their use:

- raw notam hash: Hash after the notam has been extracted and some quick formatation, for quick comparison before further processsind, exactly the same
- id hash: Hash of only relevant properties which uniquely identify a notam, the same id hash means the notam should technically be the same (but it won't always be)
- exact content hash: Hash of every raw field of the notam, exactly the same content
- forgiving content hash: Hash of the most important fields so the notam still means the same, e.g. "is new", "is replacement" is left out