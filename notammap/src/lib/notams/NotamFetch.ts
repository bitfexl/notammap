import type { NotamData } from "./notamextractor";

const NOTAM_DATA_BASE = "/notamdata/";

export async function fetchCountries(): Promise<string[]> {
    return await (await fetch(NOTAM_DATA_BASE + "countries.json")).json();
}

export async function fetchNotamData(country: string): Promise<NotamData> {
    return await (await fetch(NOTAM_DATA_BASE + country.replace(" ", "_") + ".json")).json();
}
