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
import { Search } from "../form/Search";
import { AirportsAndPlacesSearch } from "../form/AirportsAndPlacesSearch";
// import { NotamPanel } from "../panel/NotamPanel";

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

    const onCoordinatesClick = useCallback(function (c: CoordinatesList) {
        console.log(c);
    }, []);

    const onNotamsClick = useCallback(function (n: DetailedNotam[]) {
        console.log(n);
        return true;
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
                            countries={appData.countries}
                            onCountryClick={appData.setCountry}
                            currentCountry={appData.country}
                        ></MemoMap>
                    </div>
                }
                header={
                    <div>
                        <div className="p-4 rounded-md bg-white w-80" style={boxShadowStyle} ref={sideMenuHeaderRef}>
                            <h2>Notam Map {appData.country}</h2>
                            <p>
                                NOTAMS: {appData.displayedNotamData.notams.length} / {appData.loadedNotamData?.notams.length ?? 0}
                            </p>
                        </div>
                        <div
                            className="fixed top-4 p-4 bg-white rounded-md left-1/2 -translate-x-1/2 w-96 max-xl:ml-[160px] max-lg:w-80"
                            style={boxShadowStyle}
                        >
                            <AirportsAndPlacesSearch latitude={0} longitude={0}></AirportsAndPlacesSearch>
                        </div>
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
                            fullNotamData={appData.loadedNotamData}
                            countries={appData.countries}
                        ></SideMenu>
                    </div>
                }
                panels={
                    []
                    // [
                    //     <div className="w-80">
                    //         <NotamPanel height={`calc(100vh - ${headerHeight + 48 + 8}px)`}></NotamPanel>
                    //     </div>,
                    // ]
                }
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
    countries,
    onCountryClick,
    currentCountry,
}: {
    mapId: string;
    notamData: NotamData;
    newCords: L.LatLngTuple;
    newZoom: number;
    onNotamsClick: (notams: DetailedNotam[]) => boolean;
    onCooridnatesClick: (coordinates: CoordinatesList) => void;
    countries: string[];
    onCountryClick: (country: string) => void;
    currentCountry: string | null;
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
            countries={countries}
            onCountryClick={onCountryClick}
            currentCountry={currentCountry}
        ></NotamMap>
    );
});
