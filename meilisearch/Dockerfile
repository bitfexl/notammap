FROM getmeili/meilisearch AS importData
RUN apk update && apk add jq
COPY --chmod=+x importData.sh .
COPY data.json .
RUN ./importData.sh
RUN rm data.json && rm importData.sh

# WARNING: all keys are fixed at build time

FROM getmeili/meilisearch
COPY --from=importData /meili_data /meili_data
CMD meilisearch --no-analytics --env=production --master-key=$(cat masterKey.txt)