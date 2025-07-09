import { useEffect, useState } from "react";

import { NotamFilterOptionsSelector } from "./filter/NotamFilterOptionsSelector";
import countryData from "../../assets/CountryData.json";
import { NotamFilterOptions } from "./filter/notamFilter";
import { fetchCountries } from "../../api/notams/notamFetch";
import { IconButton } from "../form/IconButton";

import filterIcon from "../../assets/icons/filter.svg?raw";
import menuIcon from "../../assets/icons/menu.svg?raw";
import globeIcon from "../../assets/icons/globe.svg?raw";
import closeIcon from "../../assets/icons/x.svg?raw";
import bookmarkIcon from "../../assets/icons/bookmark.svg?raw";
import toolIcon from "../../assets/icons/tool.svg?raw";
import searchIcon from "../../assets/icons/search.svg?raw";

import { useLocalStorage } from "../../hooks/useLocalStorage";
import countryCodes from "../../assets/countryCodes.json";
import { SVGIcon } from "../icons/SVGIcon";
import { LocalStorage } from "../app/appConstants";
import { LeftSidePanel } from "../panel/LeftSidePanel";
import { NotamData } from "../../api/notams/notamextractor";

const reversedCountryCodes = (() => {
    const object: any = {};
    for (const code of Object.keys(countryCodes)) {
        object[(countryCodes as any)[code]] = code;
    }
    return object;
})();

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

    fullNotamData: NotamData | null;

    menuOpen: boolean;

    setMenuOpen: (open: boolean) => void;

    height: string;
}

type MenuType = "country" | "filter" | "notam" | "saved" | "tools";

export function SideMenu({
    filter,
    country,
    onCountryChange,
    onFilterChange,
    menuOpen,
    setMenuOpen,
    height,
    fullNotamData,
}: SideMenuProps) {
    const [countries, setCountries] = useState<string[]>([]);

    const [selectedMenu, _setSelectedMenu] = useLocalStorage<MenuType>("country", LocalStorage.Keys.MENU_SELECTED);

    function setSelectedMenu(menu: MenuType) {
        _setSelectedMenu(menu);
        setMenuOpen(true);
    }

    useEffect(() => {
        (async () => {
            setCountries((await fetchCountries()).sort());
        })();
    }, []);

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className={"flex gap-4" + (menuOpen ? "" : " flex-col")}>
                {true && <IconButton svgIcon={menuOpen ? closeIcon : menuIcon} onClick={() => setMenuOpen(!menuOpen)}></IconButton>}
                <IconButton
                    connected={menuOpen && selectedMenu == "country" ? "bottom" : "none"}
                    svgIcon={globeIcon}
                    onClick={() => setSelectedMenu("country")}
                ></IconButton>
                <IconButton
                    connected={menuOpen && selectedMenu == "filter" ? "bottom" : "none"}
                    svgIcon={filterIcon}
                    onClick={() => setSelectedMenu("filter")}
                ></IconButton>
                <IconButton
                    connected={menuOpen && selectedMenu == "saved" ? "bottom" : "none"}
                    svgIcon={bookmarkIcon}
                    onClick={() => setSelectedMenu("saved")}
                ></IconButton>
                <IconButton
                    connected={menuOpen && selectedMenu == "tools" ? "bottom" : "none"}
                    svgIcon={toolIcon}
                    onClick={() => setSelectedMenu("tools")}
                ></IconButton>
            </div>
            {menuOpen && (
                <div className="min-w-[320px]">
                    <LeftSidePanel height={height}>
                        {selectedMenu == "country" ? (
                            <CountryMenu
                                country={country}
                                countries={countries}
                                onCountryChange={onCountryChange}
                                fullNotamData={fullNotamData}
                            ></CountryMenu>
                        ) : selectedMenu == "filter" ? (
                            <div className="flex flex-col gap-4">
                                <h2>Filter Notams</h2>
                                <NotamFilterOptionsSelector options={filter} onChange={onFilterChange}></NotamFilterOptionsSelector>
                            </div>
                        ) : (
                            'No content for "' + selectedMenu + '"'
                        )}
                    </LeftSidePanel>
                </div>
            )}
        </div>
    );
}

function CountryMenu({
    country,
    onCountryChange,
    countries,
    fullNotamData,
}: {
    country: string | null;
    onCountryChange: (country: string) => void;
    countries: string[];
    fullNotamData: NotamData | null;
}) {
    const [searchContent, setSearchContent] = useState("");

    // TODO: optimize
    const lowercaseSearchContent = searchContent.toLowerCase();
    const filteredCountries = countries
        .filter((c) => c.toLowerCase().includes(lowercaseSearchContent) || lowercaseSearchContent.includes(c.toLowerCase()))
        .sort();

    return (
        <div className="flex flex-col gap-4">
            <h2>Select Country</h2>
            <div className="my-2">
                {country ? (
                    <div className="flex flex-col gap-2">
                        <h3 className="flex justify-between">
                            {country}
                            <div>
                                <img
                                    className="w-10 border border-black select-none"
                                    src={"flags/" + reversedCountryCodes[country]?.toLowerCase() + ".svg"}
                                    alt="?"
                                    draggable={false}
                                />
                            </div>
                        </h3>
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
                        <div>
                            <table>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-700 px-2">Last Updated</td>
                                        <td className="border border-gray-700 px-2">{fullNotamData?.version}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-700 px-2">NOTAMs</td>
                                        <td className="border border-gray-700 px-2">{fullNotamData?.notams.length}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-700 px-2">Parsed Coordinates</td>
                                        <td className="border border-gray-700 px-2">{fullNotamData?.coordinatesLists.length}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p>Select a country below for more information.</p>
                )}
            </div>
            <div>
                <label className="flex flex-row">
                    <SVGIcon svg={searchIcon} inline></SVGIcon>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="ml-2 w-full border-b-2 border-gray-400 outline-none focus:border-gray-700"
                        value={searchContent}
                        onChange={(e) => setSearchContent(e.target.value)}
                    />
                </label>
            </div>
            <div>
                {filteredCountries.length} {filteredCountries.length == 1 ? "country" : "countries"}{" "}
                {filteredCountries.length == countries.length ? "available" : "found"}
            </div>
            <div className="flex flex-col gap-2">
                {filteredCountries.map((country) => (
                    <button key={country} className="flex justify-between" onClick={() => onCountryChange(country)}>
                        <h3 className="pl-2">{country}</h3>
                        <div>
                            <img
                                className="w-10 border border-black select-none mr-1"
                                src={"flags/" + reversedCountryCodes[country]?.toLowerCase() + ".svg"}
                                alt="?"
                                draggable={false}
                            />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
