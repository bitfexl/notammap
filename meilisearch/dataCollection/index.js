import { queryAirportData } from "./openaip/downloadOpenAipAirportData.js";
import { queryLocationsData } from "./openstreetmap/downloadOSMCityData.js";
import fs from "node:fs";

(async () => {
    const data = [];

    data.push(...(await queryAirportData()));
    data.push(...(await queryLocationsData()));

    data.forEach((d, i) => (d.id = i));

    const json = JSON.stringify(data, null, 4);

    fs.writeFile("./data.json", json, (err) => {
        if (err) {
            console.error(err);
        }
    });
})();
