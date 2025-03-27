import { useEffect, useId, useState } from "react";
import menuIcon from "../../assets/icons/menu.svg?raw";
import closeIcon from "../../assets/icons/x.svg?raw";
import { fetchCountries } from "../notams/NotamFetch";
import { NotamFilterOptions, NotamFilterOptionsSelector } from "./filter/NotamFilterOptions";
import countryData from "../../assets/CountryData.json";

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

    const defaultValueId = useId();

    useEffect(() => {
        (async () => {
            setCountries(await fetchCountries());
        })();
    }, []);

    return (
        <>
            {menuOpen ? (
                <div className="fixed top-0 right-0 w-80 h-[100vh] bg-white p-3 overflow-auto flex flex-col gap-4">
                    <div className="text-right">
                        <button onClick={() => setMenuOpen(false)}>
                            <SVGIcon svg={closeIcon}></SVGIcon> Close Menu
                        </button>
                    </div>

                    <h2>Country</h2>
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
                    </div>

                    <span className="p-1">{/* spacing */}</span>

                    <h2>Filter</h2>
                    <NotamFilterOptionsSelector options={filter} onChange={onFilterChange}></NotamFilterOptionsSelector>
                </div>
            ) : (
                <div className="fixed top-0 right-0 p-3">
                    <button onClick={() => setMenuOpen(true)}>
                        <SVGIcon svg={menuIcon}></SVGIcon> Open Menu
                    </button>
                </div>
            )}
        </>
    );
}

function SVGIcon({ svg }: { svg: string }) {
    return <span dangerouslySetInnerHTML={{ __html: svg }} className="inline-block align-bottom"></span>;
}
