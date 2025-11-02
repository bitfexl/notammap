export interface AirportOrPlace {
    id: number;
    name?: string;
    icaoCode?: string;
    iataCode?: string;
    _geo: {
        lat: number;
        lng: number;
    };
    sortKey?: number;
    _geoDistance?: number;
}

const AIRPORTS_AND_PLACES_API = "/search";

export async function searchAirportsAndPlaces(query: string, latitude: number, longitude: number): Promise<AirportOrPlace[]> {
    const response = await (
        await fetch(AIRPORTS_AND_PLACES_API, {
            method: "POST",
            body: JSON.stringify({
                q: query,
                sort: [
                    /* "sortKey:asc", used to sort airports before places */
                    "_geoPoint(" + latitude + "," + longitude + "):asc",
                    "name:asc",
                ],
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer 36cde0efc95de701dd534f513e856b8125dc0a8acac7fb7840d4cd26a241c78f",
                // TODO: proxy in meilisearch container for authorization
            },
        })
    ).json();

    return response?.hits ?? [];
}
