#!/bin/sh

# update sources
oldhash=$(git rev-parse HEAD)
git pull
newhash=$(git rev-parse HEAD)

# check for updates
if [ "$oldhash" = "$newhash" ]
then
    echo "No update, staying on $oldhash"
else
    # save previous logs
    mkdir -p logs
    podman compose ps -f '{{.Names}}' | (
        while read name
        do
            filename=before-update-$(date -Iseconds)-$name.log
            podman compose logs -tn 2>&1 | grep --color=never $name > logs/$filename
            echo "saved logs/$filename"
        done
    )

    # rebuild and restart
    podman compose build --pull --no-cache
    podman compose down
    podman compose up -d

    echo "Updated from $oldhash to $newhash"
fi