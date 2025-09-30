const overpassApi = "https://overpass-api.de/api/interpreter";

const cityOSMQuery = `[out:json];
node["place"="city"];
out center;`;

const townsEuropeOSMQuery = `[out:json];
node["place"="town"](30,-20,70,40);
out center;`;

export async function queryLocationsData() {
    const nodes = [];
    nodes.push(...(await callOverpassApi(cityOSMQuery)).elements.map((r) => parseOsmJsonElement(r, 200)));
    nodes.push(...(await callOverpassApi(townsEuropeOSMQuery)).elements.map((r) => parseOsmJsonElement(r, 300)));
    return nodes;
}

async function callOverpassApi(query) {
    return await (
        await fetch(overpassApi, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: "data=" + encodeURIComponent(query),
        })
    ).json();
}

function parseOsmJsonElement(rawJson, sortKey) {
    return {
        name: rawJson?.tags?.name ?? null,
        nameEn: rawJson?.tags?.["name:en"] ?? null,
        _geo: {
            lat: rawJson.lat,
            lng: rawJson.lon,
        },
        sortKey,
    };
}
