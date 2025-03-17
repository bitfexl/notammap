import { useEffect, useId, useState } from "react";
import { Notam } from "../notams/notamextractor";
import menuIcon from "../../assets/icons/menu.svg?raw";
import closeIcon from "../../assets/icons/x.svg?raw";
import { fetchCountries, fetchNotams } from "../notams/NotamFetch";
import { useLocalStorage } from "../LocalStorageHook";
import { defaultFilterOptions, NotamFilterOptions, NotamFilterOptionsSelector } from "./filter/NotamFilterOptions";
import { createFilter } from "./filter/CreateFilter";
import countryData from "../../assets/CountryData.json";

export interface SideMenuProps {
    /**
     * Called when the notams change (filter or country).
     * @param notams The new notams to display.
     */
    onNotamsChange: (notams: Notam[]) => void;

    /**
     * Called when the country changes (new map location and zoom).
     * @param cords The new initial cords.
     * @param zoom The new initial zoom.
     */
    onCountryChange: (cords: L.LatLngTuple, zoom: number) => void;

    menuOpen: boolean;

    setMenuOpen: (open: boolean) => void;
}

export function SideMenu({ onNotamsChange, onCountryChange, menuOpen, setMenuOpen }: SideMenuProps) {
    const [countries, setCountries] = useState<string[]>([]);

    const [notamFilterOptions, setNotamFitlerOptions] = useLocalStorage<NotamFilterOptions>(defaultFilterOptions, "filter_options");
    const [country, setCountry] = useLocalStorage<string | null>(null, "selected_country");

    const defaultValueId = useId();

    useEffect(() => {
        (async () => {
            setCountries(await fetchCountries());
            updateNotams();
        })();
    }, []);

    useEffect(() => {
        updateNotams();
    }, [country, notamFilterOptions]);

    useEffect(() => {
        if (countryData[country]) {
            onCountryChange(countryData[country].view.center, countryData[country].view.zoom);
        }
    }, [country]);

    async function updateNotams() {
        // todo: zoom to country somewhere here
        if (country == null) {
            return;
        }
        let notams = await fetchNotams(country);
        notams = notams.filter(createFilter(notamFilterOptions));
        notams.sort((a, b) => a.series.localeCompare(b.series)); // TODO: better sorting
        onNotamsChange(notams);
    }

    return (
        <>
            {menuOpen ? (
                <div className="fixed top-0 right-0 w-80 h-[100vh] bg-white p-3 overflow-auto flex flex-col gap-4">
                    <div className="text-right">
                        <button onClick={() => setMenuOpen(false)}>
                            <span dangerouslySetInnerHTML={{ __html: closeIcon }} className="inline-block align-bottom"></span> Close Menu
                        </button>
                    </div>

                    <h2>Country</h2>
                    <div>
                        <select
                            value={country ?? defaultValueId}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-60 border border-black p-1"
                        >
                            <option value={defaultValueId} disabled={true}>
                                Select a country
                            </option>
                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>

                    <span className="p-1">{/* spacing */}</span>

                    <h2>Filter</h2>
                    <NotamFilterOptionsSelector options={notamFilterOptions} onChange={setNotamFitlerOptions}></NotamFilterOptionsSelector>
                </div>
            ) : (
                <div className="fixed top-0 right-0 p-3">
                    <button onClick={() => setMenuOpen(true)}>
                        <span dangerouslySetInnerHTML={{ __html: menuIcon }} className="inline-block align-bottom"></span> Open Menu
                    </button>
                </div>
            )}
        </>
    );
}
