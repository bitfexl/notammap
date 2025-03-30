/*
    This script extracts the center of all available countries.
    Run with: npm run extractCountryCenter
*/

import fs from "node:fs";

const overpassApi = "https://overpass-api.de/api/interpreter";

function overpassQuery(country) {
    return `
        [out:json];
        (
            relation["boundary"="administrative"]["admin_level"="2"]["name:en"="${country}"];
            relation["boundary"="administrative"]["admin_level"="2"]["official_name:en"="${country}"];
        );
        out center;
    `;
}

async function fetchJson(country) {
    return await (
        await fetch(overpassApi, {
            method: "POST",
            body: encodeURI("data=" + overpassQuery(country)),
        })
    ).json();
}

async function fetchCenter(country) {
    const elements = (await fetchJson(country)).elements;
    if (elements.length == 0) {
        return null;
    }
    return [elements[0].center.lat, elements[0].center.lon];
}

const icaoLocationIndex = fs.readFileSync("../notamextractor/src/main/resources/icaoLocationIndex.json");
const icaoLocationIndexJson = JSON.parse(icaoLocationIndex);

let countryNames = icaoLocationIndexJson.map((l) => l.country);
countryNames = countryNames.filter((c, i) => countryNames.indexOf(c) == i);

const unitedStates = "United States";
countryNames = countryNames.filter((c) => !c.startsWith(unitedStates));
countryNames.push(unitedStates);

const centerData = {};

for (const countryName of countryNames) {
    centerData[countryName] = await fetchCenter(countryName);
}

fs.writeFileSync("countryCenterData.json", JSON.stringify(centerData, null, 4));
