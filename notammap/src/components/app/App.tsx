import { memo, useCallback, useEffect, useRef, useState } from "react";
import { NotamMap } from "../map/notammap/NotamMap";
import { isSmallWidth } from "../../utils/deviceUtils";
import { renderCoordinates, renderNotams } from "../map/notammap/notamMapRenderers";
import { SideMenu } from "../menu/SideMenu";
import { CoordinatesList, DetailedNotam, NotamData } from "../../api/notams/notamextractor";
import { boxShadowStyle } from "../componentConstants";
import { MAIN_MAP_ID } from "./appConstants";
import { AppData, AppDataLayer } from "./AppDataLayer";
import { AppLayout } from "./AppLayout";

export default function App() {
    const [appData, setAppData] = useState<AppData | null>(null);

    const [menuOpen, setMenuOpen] = useState(!isSmallWidth());

    const sideMenuHeaderRef = useRef<HTMLDivElement | null>(null);
    const [sideMenuHeigt, setSideMenuHeight] = useState(0);

    useEffect(() => {
        if (sideMenuHeaderRef.current) {
            setSideMenuHeight(sideMenuHeaderRef.current.clientHeight + 32 * 3.25);
        }
    }, [appData]); // because of country name change, height changes

    function closeMenuSmallDevices() {
        if (isSmallWidth()) {
            setMenuOpen(false);
        }
    }

    const onCoordinatesClick = useCallback(function (c: CoordinatesList) {}, []);

    const onNotamsClick = useCallback(function (n: DetailedNotam[]) {
        return true || n;
    }, []);

    if (!appData) {
        // load data
        return <AppDataLayer onDataChange={setAppData}></AppDataLayer>;
    }

    return (
        <>
            <AppDataLayer onDataChange={setAppData}></AppDataLayer>
            <AppLayout
                map={
                    <div onClick={closeMenuSmallDevices} className="w-full h-full">
                        <MemoMap
                            mapId={MAIN_MAP_ID}
                            newCords={appData.mapCordsAndZoom.cords}
                            newZoom={appData.mapCordsAndZoom.zoom}
                            notamData={appData.displayedNotamData}
                            onCooridnatesClick={onCoordinatesClick}
                            onNotamsClick={onNotamsClick}
                        ></MemoMap>
                    </div>
                }
                header={
                    <div className="p-4 rounded-md bg-white w-80" style={boxShadowStyle} ref={sideMenuHeaderRef}>
                        <h2>Notam Map {appData.country}</h2>
                        <p>
                            NOTAMS: {appData.displayedNotamData.notams.length} / {appData.loadedNotams}
                        </p>
                    </div>
                }
                menu={
                    <div className="flex gap-4 max-w-sm">
                        <SideMenu
                            country={appData.country}
                            filter={appData.filterOptions}
                            onCountryChange={appData.setCountry}
                            onFilterChange={appData.setFilterOptions}
                            menuOpen={menuOpen}
                            setMenuOpen={setMenuOpen}
                            heightPx={sideMenuHeigt}
                        ></SideMenu>
                    </div>
                }
                panels={[<div className="bg-white rounded-md w-80 h-full" style={boxShadowStyle}></div>]}
            ></AppLayout>
        </>
    );
}

const MemoMap = memo(function ({
    mapId,
    notamData,
    newCords,
    newZoom,
    onNotamsClick,
    onCooridnatesClick,
}: {
    mapId: string;
    notamData: NotamData;
    newCords: L.LatLngTuple;
    newZoom: number;
    onNotamsClick: (notams: DetailedNotam[]) => boolean;
    onCooridnatesClick: (coordinates: CoordinatesList) => void;
}) {
    return (
        <NotamMap
            mapId={mapId}
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
