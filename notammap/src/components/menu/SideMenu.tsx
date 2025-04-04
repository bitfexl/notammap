import { useEffect, useId, useRef, useState } from "react";

import { NotamFilterOptionsSelector } from "./filter/NotamFilterOptionsSelector";
import countryData from "../../assets/CountryData.json";
import { NotamFilterOptions } from "./filter/notamFilter";
import { fetchCountries } from "../../api/notams/notamFetch";
import { IconButton } from "../form/IconButton";
import { boxShadowStyle } from "../componentConstants";

import filterIcon from "../../assets/icons/filter.svg?raw";
import menuIcon from "../../assets/icons/menu.svg?raw";
import globeIcon from "../../assets/icons/globe.svg?raw";
import closeIcon from "../../assets/icons/x.svg?raw";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import countryCodes from "../../assets/countryCodes.json";
import { divIcon } from "leaflet";

export interface SideMenuProps {
    filter: NotamFilterOptions;

    /**
     * Called when the notam filter options change.
     * @param filter The new notam filter options.
     */
    onFilterChange: (filter: NotamFilterOptions) => void;

    country: string | null;

    /**
     * Called when the country changes.
     * @param country The new country.
     */
    onCountryChange: (country: string) => void;

    menuOpen: boolean;

    setMenuOpen: (open: boolean) => void;
}

export function SideMenu({ filter, country, onCountryChange, onFilterChange, menuOpen, setMenuOpen }: SideMenuProps) {
    const [countries, setCountries] = useState<string[]>([]);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    const [selectedMenu, setSelectedMenu] = useLocalStorage<"country" | "filter" | "notam">("country", "menu");

    useEffect(() => {
        (async () => {
            setCountries(await fetchCountries());
        })();
    }, []);

    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.getBoundingClientRect().height);
        }
    }, [menuOpen]);

    return (
        <div className="flex flex-col border border-green-500">
            <div className={"flex gap-4" + (menuOpen ? "" : " flex-col")}>
                {true && <IconButton svgIcon={menuOpen ? closeIcon : menuIcon} onClick={() => setMenuOpen(!menuOpen)}></IconButton>}
                <IconButton svgIcon={globeIcon} onClick={() => setSelectedMenu("country")}></IconButton>
                <IconButton svgIcon={filterIcon} onClick={() => setSelectedMenu("filter")}></IconButton>
            </div>
            {menuOpen && (
                <div
                    className="p-1 bg-white rounded-md"
                    style={{ ...boxShadowStyle, height: `calc(100% - ${headerHeight + 16 /* 16 px = p-4 padding*/}px` }}
                >
                    {/* change position of scrollbar, padding of parent for spacing around scrollbar */}
                    <div className="overflow-auto h-full" style={{ direction: "rtl" }}>
                        <div className="p-4" style={{ direction: "initial" }}>
                            {selectedMenu == "country" ? (
                                <CountryMenu country={country} countries={countries} onCountryChange={onCountryChange}></CountryMenu>
                            ) : selectedMenu == "filter" ? (
                                <div className="flex flex-col gap-4">
                                    <h2>Filter Notams</h2>
                                    <NotamFilterOptionsSelector options={filter} onChange={onFilterChange}></NotamFilterOptionsSelector>
                                </div>
                            ) : (
                                "No content"
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CountryMenu({
    country,
    onCountryChange,
    countries,
}: {
    country: string | null;
    onCountryChange: (country: string) => void;
    countries: string[];
}) {
    const defaultValueId = useId();

    return (
        <div className="flex flex-col gap-4">
            <h2>Select Country</h2>
            <div className="flex gap-4">
                {country && (countryData as any)[country]?.AIPLinks.allProducts && (
                    <a href={(countryData as any)[country].AIPLinks.allProducts} target="_blank">
                        Online AIM
                    </a>
                )}
                {country && (countryData as any)[country]?.AIPLinks.aipDirect && (
                    <a href={(countryData as any)[country].AIPLinks.aipDirect} target="_blank">
                        Online AIP
                    </a>
                )}
                {country && !(countryData as any)[country] && (
                    <a href="https://www.ead.eurocontrol.int/cms-eadbasic/opencms/en/login/ead-basic/" target="_blank">
                        Eurocontrol EAD (Online AIP)
                    </a>
                )}
            </div>
            <div>
                <select
                    value={country ?? defaultValueId}
                    onChange={(e) => onCountryChange(e.target.value)}
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
            <div>
                {Object.keys(countryCodes).map((c) => (
                    <div key={c}>
                        <h3>{(countryCodes as any)[c]}</h3>
                        <img src={"flags/" + c.toLowerCase() + ".svg"} alt="" />
                    </div>
                ))}
            </div>
        </div>
    );
}
