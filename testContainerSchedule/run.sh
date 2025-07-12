#!/bin/bash
echo "RUNNING..."
if test $(($RANDOM % 5)) -eq 0
then
echo "FAIL"
exit 1
fi
exit 0
