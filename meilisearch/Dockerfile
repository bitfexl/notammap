FROM docker.io/getmeili/meilisearch AS importData
RUN apk update && apk add jq
COPY --chmod=777 importData.sh .
COPY data.json .
RUN ./importData.sh
RUN rm data.json && rm importData.sh

# WARNING: all keys are fixed at build time

FROM docker.io/getmeili/meilisearch AS dev
COPY --from=importData /meili_data /meili_data
CMD echo -n "Search key: "; cat searchKey.txt; echo -n "Admin key: "; cat adminKey.txt; meilisearch --no-analytics --env=development --master-key=$(cat masterKey.txt)

FROM docker.io/getmeili/meilisearch
COPY --from=importData /meili_data /meili_data
CMD meilisearch --no-analytics --env=production --master-key=$(cat masterKey.txt)