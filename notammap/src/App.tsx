import { useState, useEffect } from "react";
import { NotamMap } from "./lib/map/notammap/NotamMap";
import { fetchCountries, fetchNotams } from "./lib/notams/NotamFetch";
import { Notam } from "./lib/notams/notamextractor";
import { NotamFilter, NotamMarkerProducer, defaultFilter, defaultMarkerProducer } from "./lib/map/notammap/NotamDisplayHelpers";
import { NotamFilterOptions, NotamFilterOptionsSelector, defaultFilterOptions } from "./lib/filter/NotamFilterOptions";
import { createFilter } from "./lib/filter/CreateFilter";

function App() {
    const [notams, setNotmas] = useState<Notam[]>([]);

    const [notamFilterOptions, setNotamFitlerOptions] = useState<NotamFilterOptions>(defaultFilterOptions);
    const [notamFilter, _setNotamFilter] = useState<NotamFilter>(() => defaultFilter);
    const [notamMarkerProducer, _setNotamMarkerProducer] = useState<NotamMarkerProducer>(() => defaultMarkerProducer);

    function setNotamFilter(filter: NotamFilter) {
        _setNotamFilter(() => filter);
    }

    function setNotamMarkerProducer(markerProducer: NotamMarkerProducer) {
        _setNotamMarkerProducer(() => markerProducer);
    }

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

    return (
        <>
            <h1>Notam Map</h1>
            <NotamMap notams={notams} filter={notamFilter} markerProducer={notamMarkerProducer}></NotamMap>
            <br />
            <NotamFilterOptionsSelector options={notamFilterOptions} onChange={setNotamFitlerOptions}></NotamFilterOptionsSelector>
        </>
    );
}

export default App;
