#!/bin/sh

function main {
    masterKey=$(< /dev/random tr -dc 'A-Za-z0-9' | head -c 64)
    echo "$masterKey" > masterKey.txt

    nohup meilisearch --no-analytics --env=production --master-key=$masterKey &

    echo "Meilisearch started."

    until curl -sfo /dev/null http://localhost:7700/health
    do
        sleep 1
    done

    response=$(curl -s 'http://localhost:7700/keys' \
        -H "Authorization: Bearer $masterKey")

    searchKey=$(echo "$response" | jq -r '.results[] | select(.name == "Default Search API Key") | .key')
    adminKey=$(echo "$response" | jq -r '.results[] | select(.name == "Default Admin API Key") | .key')
    echo "$searchKey" > searchKey.txt 
    echo "$adminKey" > adminKey.txt

    response=$(curl -s \
        -X POST 'http://localhost:7700/indexes' \
        -H "Authorization: Bearer $adminKey" \
        -H 'Content-Type: application/json' \
        -d '{"uid":"dataIndex","primaryKey":"id"}')

    waitForCompletion

    echo "Index created."
    echo "Importing data..."

    response=$(curl -s \
        -X POST 'http://localhost:7700/indexes/dataIndex/documents' \
        -H "Authorization: Bearer $adminKey" \
        -H 'Content-Type: application/json' \
        -d '@data.json')

    waitForCompletion

    echo "Import complete."

    kill $(pgrep meilisearch)
}

function waitForCompletion ( ) {
    taskUid=$(echo "$response" | jq .taskUid)
    until checkStatus
    do
        sleep 1
    done
}

function checkStatus ( ) (
    response=$(curl -s "http://localhost:7700/tasks/$taskUid" -H "Authorization: Bearer $adminKey")
    status=$(echo "$response" | jq -r .status)
    [ $status = "succeeded" ]
)

main