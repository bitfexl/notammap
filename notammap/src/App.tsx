import { useState, useEffect, useId } from "react";
import { NotamMap } from "./lib/map/notammap/NotamMap";
import { fetchCountries, fetchNotams } from "./lib/notams/NotamFetch";
import { Notam } from "./lib/notams/notamextractor";
import { NotamFilter, NotamMarkerProducer } from "./lib/map/notammap/NotamDisplayHelpers";
import { NotamFilterOptions, NotamFilterOptionsSelector, defaultFilterOptions } from "./lib/filter/NotamFilterOptions";
import { createFilter } from "./lib/filter/CreateFilter";
import { isSmallWidth } from "./lib/DeviceUtils";
import { useLocalStorage } from "./lib/LocalStorageHook";
import { markerProducer } from "./lib/map/notammap/marker/CreateMarker";
import menuIcon from "./assets/icons/menu.svg?raw";
import closeIcon from "./assets/icons/x.svg?raw";

function App() {
    const [countries, setCountries] = useState<string[]>([]);
    const [notams, setNotmas] = useState<Notam[]>([]);

    const [notamFilterOptions, setNotamFitlerOptions] = useLocalStorage<NotamFilterOptions>(defaultFilterOptions, "filter_options");
    const [notamFilter, _setNotamFilter] = useState<NotamFilter>(() => createFilter(defaultFilterOptions));
    const [notamMarkerProducer, _setNotamMarkerProducer] = useState<NotamMarkerProducer>(() => markerProducer);

    const [menuOpen, setMenuOpen] = useState(!isSmallWidth());

    const defaultValueId = useId();

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
            setCountries(await fetchCountries());
        })();
    }, []);

    async function updateNotams(country: string) {
        const notams = await fetchNotams(country);

        notams.sort((a, b) => a.series.localeCompare(b.series));
        console.log(notams); // TODO Test

        setNotmas(notams);
    }

    function closeMenuSmallDevices() {
        if (isSmallWidth()) {
            setMenuOpen(false);
        }
    }

    return (
        <>
            <div onClick={closeMenuSmallDevices} className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-10">
                <NotamMap
                    notams={notams}
                    filter={notamFilter}
                    markerProducer={notamMarkerProducer}
                    initialCoords={[49, 12]}
                    initialZoom={5}
                ></NotamMap>
            </div>

            {menuOpen ? (
                <div className="fixed top-0 right-0 w-80 h-[100vh] bg-white p-3 overflow-auto flex flex-col gap-4">
                    <div className="text-right">
                        <button onClick={() => setMenuOpen(false)}>
                            <span dangerouslySetInnerHTML={{ __html: closeIcon }} className="inline-block align-bottom"></span> Close Menu
                        </button>
                    </div>

                    <h2>Country</h2>
                    <div>
                        <select
                            defaultValue={defaultValueId}
                            onChange={(e) => updateNotams(e.target.value)}
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

                    <span className="p-1">{/* spacing */}</span>

                    <h2>Filter</h2>
                    <NotamFilterOptionsSelector options={notamFilterOptions} onChange={setNotamFitlerOptions}></NotamFilterOptionsSelector>
                </div>
            ) : (
                <div className="fixed top-0 right-0 p-3">
                    <button onClick={() => setMenuOpen(true)}>
                        <span dangerouslySetInnerHTML={{ __html: menuIcon }} className="inline-block align-bottom"></span> Open Menu
                    </button>
                </div>
            )}
        </>
    );
}

export default App;
