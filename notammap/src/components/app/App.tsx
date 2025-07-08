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
import { NotamPanel } from "../panel/NotamPanel";

export default function App() {
    const [appData, setAppData] = useState<AppData | null>(null);

    const [menuOpen, setMenuOpen] = useState(!isSmallWidth());

    const sideMenuHeaderRef = useRef<HTMLDivElement | null>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        if (sideMenuHeaderRef.current) {
            setHeaderHeight(sideMenuHeaderRef.current.clientHeight);
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
                            height={`calc(100vh - ${headerHeight + 32 * 3 + 8}px)`}
                        ></SideMenu>
                    </div>
                }
                panels={[
                    <div className="w-80">
                        <NotamPanel height={`calc(100vh - ${headerHeight + 48 + 8}px)`}></NotamPanel>
                    </div>,
                ]}
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
