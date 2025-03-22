import { useState } from "react";
import { NotamMap } from "./lib/map/notammap/NotamMap";
import { Notam } from "./lib/notams/notamextractor";
import { isSmallWidth } from "./lib/DeviceUtils";

import { renderNotam } from "./lib/map/notammap/notamRenderer";
import { SideMenu } from "./lib/menu/SideMenu";

export default function App() {
    const [notams, setNotmas] = useState<Notam[]>([]);
    const [currentCords, setCurrentCords] = useState<L.LatLngTuple>([49, 12]);
    const [currentZoom, setCurrentZoom] = useState<number>(5);

    const [menuOpen, setMenuOpen] = useState(!isSmallWidth());

    function closeMenuSmallDevices() {
        if (isSmallWidth()) {
            setMenuOpen(false);
        }
    }

    // TDOD: deduplicate notams, notams are duplicated if for multiple locations
    // in backend remove notams which might have been fetched for two different locations

    return (
        <>
            <div onClick={closeMenuSmallDevices} className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-10">
                <NotamMap notams={notams} notamRenderer={renderNotam} currentCords={currentCords} currentZoom={currentZoom}></NotamMap>
            </div>

            <SideMenu
                onCountryChange={(cords, zoom) => {
                    setCurrentCords(cords);
                    setCurrentZoom(zoom);
                }}
                onNotamsChange={setNotmas}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
            ></SideMenu>
        </>
    );
}
