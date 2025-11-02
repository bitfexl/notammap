import { ReactNode, useState } from "react";
import { Search } from "./Search";
import { AirportOrPlace, searchAirportsAndPlaces } from "../../api/search/search";
import mapPinIcon from "../../assets/icons/map-pin.svg?raw";
import towerIcon from "../../assets/icons/airport-runway.svg?raw";
import { SVGIcon } from "../icons/SVGIcon";

export interface AirportsAndPlacesSearchProps {
    latitude: number;
    longitude: number;
}

export function AirportsAndPlacesSearch({ latitude, longitude }: AirportsAndPlacesSearchProps) {
    const [showResults, setShowResults] = useState(true);
    const [results, setResults] = useState<AirportOrPlace[]>([]);

    function select(aop: AirportOrPlace) {
        console.log(aop);
    }

    // TODO: search clear button on the right

    return (
        <div>
            <Search
                placeholder="Search airports and places..."
                results={mapResults(results)}
                onSearch={async (query) => setResults(query.length >= 2 ? await searchAirportsAndPlaces(query, latitude, longitude) : [])}
                showResults={showResults && results.length != 0}
                onSelect={(key) => {
                    const aop = results.find((r) => r.id == key);
                    if (aop) {
                        select(aop);
                    }
                }}
            ></Search>
        </div>
    );
}

function mapResults(searchResults: AirportOrPlace[]): { key: number; content: ReactNode }[] {
    return searchResults.map((s) => ({
        key: s.id,
        content: (
            <div className="flex justify-between">
                <p>
                    {s.name ?? "no name"}
                    {s.icaoCode ? (
                        <code>
                            {" "}
                            ({s.icaoCode}
                            {s.iataCode && ", " + s.iataCode})
                        </code>
                    ) : null}
                </p>
                <SVGIcon svg={s.icaoCode ? towerIcon : mapPinIcon} inline></SVGIcon>
            </div>
        ),
    }));
}
