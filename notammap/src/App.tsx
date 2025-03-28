import { useEffect, useState } from "react";
import { NotamMap } from "./lib/map/notammap/NotamMap";
import { isSmallWidth } from "./lib/DeviceUtils";

import { renderCoordinates, renderNotams } from "./lib/map/notammap/notamRenderer";
import { SideMenu } from "./lib/menu/SideMenu";

import countryData from "./assets/CountryData.json";
import { NotamData } from "./lib/notams/notamextractor";
import { fetchNotamData } from "./lib/notams/NotamFetch";
import { defaultFilterOptions, NotamFilterOptions } from "./lib/menu/filter/NotamFilterOptions";
import { createFilter } from "./lib/menu/filter/CreateFilter";
import { useLocalStorage } from "./lib/LocalStorageHook";

const EMPTY_NOTAM_DATA = { version: "0.0", notams: [], coordinatesLists: [] };

export default function App() {
    const [currentCords, setCurrentCords] = useState<L.LatLngTuple>([49, 12]);
    const [currentZoom, setCurrentZoom] = useState<number>(5);

    const [menuOpen, setMenuOpen] = useState(!isSmallWidth());

    const [country, setCountry] = useLocalStorage<string | null>(null, "country");
    const [filter, setFilter] = useLocalStorage<NotamFilterOptions>(defaultFilterOptions, "filter");

    const [notamData, setNotamData] = useState<NotamData | null>(null);
    const [displayedNotamData, setDisplayedNotamData] = useState<NotamData>(EMPTY_NOTAM_DATA);

    function closeMenuSmallDevices() {
        if (isSmallWidth()) {
            setMenuOpen(false);
        }
    }

    useEffect(() => {
        (async () => {
            if (!country) {
                return;
            }

            if ((countryData as any)[country]) {
                setCurrentCords((countryData as any)[country].view.center);
                setCurrentZoom((countryData as any)[country].view.zoom);
            }

            const newNotamData = await fetchNotamData(country);

            if (newNotamData?.version == "1.0") {
                setNotamData(newNotamData);
            } else {
                alert(
                    "Notamdata for " +
                        country +
                        " is on version " +
                        newNotamData.version +
                        ", but the app currently only supports version 1.0."
                );
            }
        })();
    }, [country]);

    useEffect(() => {
        if (notamData == null) {
            return;
        }

        const notams = notamData.notams.filter(createFilter(filter));

        const containedHashes = notams
            .flatMap((n) => n.textNodes)
            .filter((t) => t.reference?.coordinatesList != null)
            .map((cr) => cr.reference?.coordinatesList);

        const filteredData: NotamData = {
            version: notamData.version,
            notams,
            coordinatesLists: notamData.coordinatesLists.filter((cl) => containedHashes.includes(cl.hash)),
        };

        setDisplayedNotamData(filteredData);
    }, [notamData, filter]);

    return (
        <>
            <div onClick={closeMenuSmallDevices} className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-10">
                <NotamMap
                    notamData={displayedNotamData}
                    notamRenderer={renderNotams}
                    coordinatesRenderer={renderCoordinates}
                    currentCords={currentCords}
                    currentZoom={currentZoom}
                    onNotamsClick={() => true}
                    onCooridnatesClick={(c) =>
                        setDisplayedNotamData((data) => ({
                            ...data,
                            coordinatesLists: data.coordinatesLists.filter((c2) => c2.hash != c.hash),
                        }))
                    }
                ></NotamMap>
            </div>

            <SideMenu
                country={country}
                filter={filter}
                onCountryChange={setCountry}
                onFilterChange={setFilter}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
            ></SideMenu>
        </>
    );
}
