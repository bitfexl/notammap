import type { Notam } from "./notamextractor";

const NOTAM_DATA_BASE = "/notamdata/";

export async function fetchCountries(): Promise<string[]> {
    return await (await fetch(NOTAM_DATA_BASE + "countries.json")).json();
}

export async function fetchNotams(country: string): Promise<Notam[]> {
    return await (await fetch(NOTAM_DATA_BASE + country.replace(" ", "_") + ".json")).json();
}
