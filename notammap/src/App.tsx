import { useState, useEffect } from "react";
import { NotamMap } from "./lib/map/notammap/NotamMap";
import { fetchCountries, fetchNotams } from "./lib/notams/NotamFetch";
import { Notam } from "./lib/notams/notamextractor";
import { NotamFilter, NotamMarkerProducer, defaultMarkerProducer } from "./lib/map/notammap/NotamDisplayHelpers";
import { NotamFilterOptions, NotamFilterOptionsSelector, defaultFilterOptions } from "./lib/filter/NotamFilterOptions";
import { createFilter } from "./lib/filter/CreateFilter";
import { isSmallWidth } from "./lib/DeviceUtils";
import { useLocalStorage } from "./lib/LocalStorageHook";

function App() {
    const [notams, setNotmas] = useState<Notam[]>([]);

    const [notamFilterOptions, setNotamFitlerOptions] = useLocalStorage<NotamFilterOptions>(defaultFilterOptions, "filter_options");
    const [notamFilter, _setNotamFilter] = useState<NotamFilter>(() => createFilter(defaultFilterOptions));
    const [notamMarkerProducer, _setNotamMarkerProducer] = useState<NotamMarkerProducer>(() => defaultMarkerProducer);

    const [menuOpen, setMenuOpen] = useState(!isSmallWidth());

    function setNotamFilter(filter: NotamFilter) {
        _setNotamFilter(() => filter);
    }

    // function setNotamMarkerProducer(markerProducer: NotamMarkerProducer) {
    //     _setNotamMarkerProducer(() => markerProducer);
    // }

    useEffect(() => {
        setNotamFilter(createFilter(notamFilterOptions));
    }, [notamFilterOptions]);

    useEffect(() => {
        (async () => {
            const countries = await fetchCountries();
            setNotmas(await fetchNotams(countries[0]));
            // for (const country of countries) {
            //     console.log(country + ":");
            //     const notams = await fetchNotams(country);
            //     console.log(notams);
            //     setNotmas((old) => [...old, ...notams]);
            // }
        })();
    }, []);

    function closeMenuSmallDevices() {
        if (isSmallWidth()) {
            setMenuOpen(false);
        }
    }

    return (
        <>
            <div onClick={closeMenuSmallDevices} className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-10">
                <NotamMap notams={notams} filter={notamFilter} markerProducer={notamMarkerProducer}></NotamMap>
            </div>

            {menuOpen ? (
                <div className="fixed top-0 right-0 w-80 h-[100vh] bg-white p-3 overflow-auto">
                    <div className="text-right">
                        <button onClick={() => setMenuOpen(false)}>Close Menu</button>
                    </div>

                    <NotamFilterOptionsSelector options={notamFilterOptions} onChange={setNotamFitlerOptions}></NotamFilterOptionsSelector>
                </div>
            ) : (
                <div className="fixed top-0 right-0 p-3">
                    <button onClick={() => setMenuOpen(true)}>Open Menu</button>
                </div>
            )}
        </>
    );
}

export default App;
