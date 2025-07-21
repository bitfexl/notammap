#!/bin/sh

podman compose ps -f '{{.Names}}' | cat -n
echo -n 'Select container (number) or press ENTER for full logs: '
read selection

if [ -n "$selection" ]
then
    podman compose logs -tn 2>&1 | grep --color=never $(podman compose ps -f '{{.Names}}' | head -n $selection | tail -n 1) | less +G
else
    podman compose logs -tn 2>&1 | less +G
fi