#!/bin/sh

set -e

# update sources
oldhash=$(git rev-parse HEAD)
git pull
newhash=$(git rev-parse HEAD)

# check for updates
if [ "$oldhash" = "$newhash" ]
then
    echo "No source update, staying on $oldhash"
else
    echo "Updated source from $oldhash to $newhash"
fi

# rebuild (config changes, etc...)
./build-images.sh

systemctl restart notammap-webserver.service