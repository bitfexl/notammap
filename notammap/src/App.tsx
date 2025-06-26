import { memo, useCallback, useEffect, useRef, useState } from "react";
import { NotamMap } from "./components/map/notammap/NotamMap";
import { isSmallWidth } from "./utils/deviceUtils";

import { renderCoordinates, renderNotams } from "./components/map/notammap/notamMapRenderers";
import { SideMenu } from "./components/menu/SideMenu";

import countryCenterData from "./assets/countryCenterData.json";
import { CoordinatesList, DetailedNotam, NotamData } from "./api/notams/notamextractor";
import { fetchNotamData } from "./api/notams/notamFetch";
import { defaultFilterOptions, filterNotamData, NotamFilterOptions } from "./components/menu/filter/notamFilter";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { boxShadowStyle } from "./components/componentConstants";
import { LEAFLET_MAP_EVENT, LeafletMapEvent } from "./components/map/LeafletMap";
import { LocalStorage } from "./appConstants";

// add event listener to update cords and zoom if user changed it
addEventListener(LEAFLET_MAP_EVENT, (event: LeafletMapEvent) => {
    // TODO: add map id check
    const cordsAndZoom: LocalStorage.Types.MapCordsAndZoom = { cords: event.latLng, zoom: event.zoom };
    localStorage.setItem(LocalStorage.Keys.MAP_CORDS_AND_ZOOM, JSON.stringify(cordsAndZoom));
});

const EMPTY_NOTAM_DATA = { version: "0.0", notams: [], coordinatesLists: [] };

export default function App() {
    // cords and zoom only to update map (fly to) does not necessarily represent the actual current cords or zoom (user changed it)
    // persistence is achieved with the leaflet map event the contents of which are directly written to local storage for availability after reload
    // see above event listener
    // TODO: country change useEffect is triggered immediately after load so position is overwritten
    const [_mapCordsAndZoom, setMapCordsAndZoom] = useLocalStorage<LocalStorage.Types.MapCordsAndZoom>(
        { cords: [49, 12], zoom: 5 },
        LocalStorage.Keys.MAP_CORDS_AND_ZOOM
    );

    const [country, setCountry] = useLocalStorage<string | null>(null, LocalStorage.Keys.DATA_COUNTRY);
    const [filter, setFilter] = useLocalStorage<NotamFilterOptions>(defaultFilterOptions, LocalStorage.Keys.DATA_FILTER);

    const [notamData, setNotamData] = useState<NotamData | null>(null);
    const [displayedNotamData, setDisplayedNotamData] = useState<NotamData>(EMPTY_NOTAM_DATA);

    const [menuOpen, setMenuOpen] = useState(!isSmallWidth());

    const sideMenuHeaderRef = useRef<HTMLDivElement | null>(null);
    const [sideMenuHeigt, setSideMenuHeight] = useState(0);

    useEffect(() => {
        if (sideMenuHeaderRef.current) {
            setSideMenuHeight(sideMenuHeaderRef.current.clientHeight + 32 * 3.25);
        }
    }, [country]);

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

            if ((countryCenterData as any)[country]) {
                setMapCordsAndZoom({ cords: (countryCenterData as any)[country], zoom: 7 });
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
        // console.log("data or filter changed");
    }, [notamData, filter]);

    const onCoordinatesClick = useCallback(function (c: CoordinatesList) {
        setDisplayedNotamData((data) => ({
            ...data,
            coordinatesLists: data.coordinatesLists.filter((c2) => c2.hash != c.hash),
        }));
    }, []);

    const onNotamsClick = useCallback(function (n: DetailedNotam[]) {
        return true || n;
    }, []);

    return (
        <>
            <div onClick={closeMenuSmallDevices} className="fixed top-0 left-0 w-[100vw] h-[100vh]">
                <MemoMap
                    newCords={_mapCordsAndZoom.cords}
                    newZoom={_mapCordsAndZoom.zoom}
                    notamData={displayedNotamData}
                    onCooridnatesClick={onCoordinatesClick}
                    onNotamsClick={onNotamsClick}
                ></MemoMap>
            </div>

            <div className="fixed top-4 left-4 flex flex-col gap-4 w-80">
                <div className="p-4 rounded-md bg-white" style={boxShadowStyle} ref={sideMenuHeaderRef}>
                    <h2>Notam Map {country}</h2>
                </div>
                <div>
                    <SideMenu
                        country={country}
                        filter={filter}
                        onCountryChange={setCountry}
                        onFilterChange={setFilter}
                        menuOpen={menuOpen}
                        setMenuOpen={setMenuOpen}
                        heightPx={sideMenuHeigt}
                    ></SideMenu>
                </div>
            </div>
        </>
    );
}

const MemoMap = memo(function ({
    notamData,
    newCords,
    newZoom,
    onNotamsClick,
    onCooridnatesClick,
}: {
    notamData: NotamData;
    newCords: L.LatLngTuple;
    newZoom: number;
    onNotamsClick: (notams: DetailedNotam[]) => boolean;
    onCooridnatesClick: (coordinates: CoordinatesList) => void;
}) {
    return (
        <NotamMap
            notamData={notamData}
            notamRenderer={renderNotams}
            coordinatesRenderer={renderCoordinates}
            newCords={newCords}
            newZoom={newZoom}
            onNotamsClick={onNotamsClick}
            onCooridnatesClick={onCooridnatesClick}
        ></NotamMap>
    );
});
