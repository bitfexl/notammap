import { useEffect, useId, useRef, useState } from "react";
import menuIcon from "../../assets/icons/menu.svg?raw";
import closeIcon from "../../assets/icons/x.svg?raw";
import gpsLocateIcon from "../../assets/icons/layers.svg?raw";
import { NotamFilterOptionsSelector } from "./filter/NotamFilterOptionsSelector";
import countryData from "../../assets/CountryData.json";
import { SVGIcon } from "../icons/SVGIcon";
import { NotamFilterOptions } from "./filter/notamFilter";
import { fetchCountries } from "../../api/notams/notamFetch";
import { IconButton } from "../form/IconButton";
import filterIcon from "../../assets/icons/filter.svg?raw";
import { boxShadowStyle } from "../componentConstants";

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
        <>
            {menuOpen ? (
                <div className="h-full flex flex-col gap-4">
                    <div className="p-4 rounded-md bg-white" style={boxShadowStyle} ref={headerRef}>
                        <h2>Notammap {country}</h2>
                    </div>
                    <div
                        className="w-80 p-1 bg-white rounded-md"
                        style={{ ...boxShadowStyle, height: `calc(100% - ${headerHeight + 16 /* 16 px = p-4 padding*/}px` }}
                    >
                        {/* change position of scrollbar, padding of parent for spacing around scrollbar */}
                        <div className="overflow-auto h-full" style={{ direction: "rtl" }}>
                            <div className="p-4" style={{ direction: "initial" }}>
                                <SideMenuContent
                                    filter={filter}
                                    country={country}
                                    onCountryChange={onCountryChange}
                                    onFilterChange={onFilterChange}
                                    countries={countries}
                                ></SideMenuContent>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <IconButton svgIcon={menuIcon} onClick={() => setMenuOpen(true)}></IconButton>
                    <IconButton svgIcon={filterIcon} onClick={() => alert("filter")}></IconButton>
                    <IconButton svgIcon={filterIcon} onClick={() => alert("filter")}></IconButton>
                </div>
            )}
        </>
    );
}

function SideMenuContent({
    filter,
    country,
    onCountryChange,
    onFilterChange,
    countries,
}: {
    filter: NotamFilterOptions;
    onFilterChange: (filter: NotamFilterOptions) => void;
    country: string | null;
    onCountryChange: (country: string) => void;
    countries: string[];
}) {
    const defaultValueId = useId();

    return (
        <div className="flex flex-col gap-4">
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
    );
}
