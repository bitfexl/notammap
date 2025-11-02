FROM docker.io/getmeili/meilisearch AS importData
RUN apk update && apk add jq
COPY --chmod=777 importData.sh .
COPY data.json .
RUN ./importData.sh
RUN rm data.json && rm importData.sh

# WARNING: all keys are fixed at build time

# TODO: proxy for authorization

FROM docker.io/getmeili/meilisearch AS meilisearchBase
COPY --from=importData /meili_data /meili_data

FROM meilisearchBase AS dev
CMD echo -n "Search key: "; cat searchKey.txt; echo -n "Admin key: "; cat adminKey.txt; meilisearch --no-analytics --env=development --master-key=$(cat masterKey.txt)

FROM meilisearchBase
CMD meilisearch --no-analytics --env=production --master-key=$(cat masterKey.txt)