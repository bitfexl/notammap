// download openaip airport data (see: https://www.openaip.net/docs)

const bucketUrl = "https://storage.googleapis.com/storage/v1/b/29f98e10-a489-4c82-ae5e-489dbcd4912f/o";
const bucketUrlWithToken = bucketUrl + "?pageToken=";

export async function queryAirportData() {
    const jsonExports = await getAirportJsonExports();
    const airports = [];
    for (const jsonExport of jsonExports) {
        const json = await (await fetch(jsonExport.url)).json();
        for (const airport of json) {
            airports.push(parseAirportJson(airport));
        }
    }
    return airports;
}

async function getAirportJsonExports() {
    let items = [];
    let json = await (await fetch(bucketUrl)).json();
    items.push(...json.items);
    while (json.nextPageToken) {
        json = await (await fetch(bucketUrlWithToken + json.nextPageToken)).json();
        items.push(...json.items);
    }
    items = items.map((i) => ({ name: i.name, url: i.mediaLink })).filter((i) => i.name.endsWith("_apt.json"));
    return items;
}

function parseAirportJson(rawJson) {
    return {
        name: rawJson.name ?? null,
        icaoCode: rawJson.icaoCode ?? null,
        iataCode: rawJson.iataCode ?? null,
        _geo: {
            lat: rawJson.geometry.coordinates[0],
            lng: rawJson.geometry.coordinates[1],
        },
    };
}
