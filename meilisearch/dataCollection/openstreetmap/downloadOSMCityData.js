const overpassApi = "https://overpass-api.de/api/interpreter";

const overpassQueries = [
    // cities worldwide
    `[out:json];
node["place"="city"];
out center;`,
    // towns in europe
    `[out:json];
node["place"="town"](30,-20,70,40);
out center;`,
];

export async function queryLocationsData() {
    const rawOsmNodes = [];
    for (const query of overpassQueries) {
        rawOsmNodes.push(...(await callOverpassApi(query)).elements);
    }
    return rawOsmNodes.map(parseOsmJsonElement);
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

function parseOsmJsonElement(rawJson) {
    return {
        name: rawJson?.tags?.name ?? null,
        nameEn: rawJson?.tags?.["name:en"] ?? null,
        _geo: {
            lat: rawJson.lat,
            lng: rawJson.lon,
        },
    };
}
