import { memo, useCallback, useEffect, useState } from "react";
import { NotamMap } from "./components/map/notammap/NotamMap";
import { isSmallWidth } from "./utils/deviceUtils";

import { renderCoordinates, renderNotams } from "./components/map/notammap/notamMapRenderers";
import { SideMenu } from "./components/menu/SideMenu";

import countryData from "./assets/CountryData.json";
import { CoordinatesList, DetailedNotam, NotamData } from "./api/notams/notamextractor";
import { fetchNotamData } from "./api/notams/notamFetch";
import { defaultFilterOptions, filterNotamData, NotamFilterOptions } from "./components/menu/filter/notamFilter";
import { useLocalStorage } from "./hooks/useLocalStorage";

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
        if (notamData != null) {
            setDisplayedNotamData(filterNotamData(notamData, filter));
        }
        console.log("data or filter changed");
    }, [notamData, filter]);

    const onCoordinatesClick = useCallback(function (c: CoordinatesList) {
        setDisplayedNotamData((data) => ({
            ...data,
            coordinatesLists: data.coordinatesLists.filter((c2) => c2.hash != c.hash),
        }));
    }, []);

    const onNotamsClick = useCallback(function (n: DetailedNotam[]) {
        return true;
    }, []);

    return (
        <>
            <div onClick={closeMenuSmallDevices} className="fixed top-0 left-0 w-[100vw] h-[100vh]">
                <MemoMap
                    currentCords={currentCords}
                    currentZoom={currentZoom}
                    notamData={displayedNotamData}
                    onCooridnatesClick={onCoordinatesClick}
                    onNotamsClick={onNotamsClick}
                ></MemoMap>
            </div>

            <div className="fixed top-4 left-4 h-[100vh] pb-8">
                <SideMenu
                    country={country}
                    filter={filter}
                    onCountryChange={setCountry}
                    onFilterChange={setFilter}
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                ></SideMenu>
            </div>
        </>
    );
}

const MemoMap = memo(function ({
    notamData,
    currentCords,
    currentZoom,
    onNotamsClick,
    onCooridnatesClick,
}: {
    notamData: NotamData;
    currentCords: L.LatLngTuple;
    currentZoom: number;
    onNotamsClick: (notams: DetailedNotam[]) => boolean;
    onCooridnatesClick: (coordinates: CoordinatesList) => void;
}) {
    return (
        <NotamMap
            notamData={notamData}
            notamRenderer={renderNotams}
            coordinatesRenderer={renderCoordinates}
            currentCords={currentCords}
            currentZoom={currentZoom}
            onNotamsClick={onNotamsClick}
            onCooridnatesClick={onCooridnatesClick}
        ></NotamMap>
    );
});
