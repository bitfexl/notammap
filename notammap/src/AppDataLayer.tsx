import { useEffect, useState } from "react";
import { LocalStorage, MAIN_MAP_ID } from "./appConstants";
import { LEAFLET_MAP_EVENT, LeafletMapEvent } from "./components/map/LeafletMap";
import { defaultFilterOptions, filterNotamData, NotamFilterOptions } from "./components/menu/filter/notamFilter";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { NotamData } from "./api/notams/notamextractor";
import { fetchNotamData } from "./api/notams/notamFetch";
import countryCenterData from "./assets/countryCenterData.json";

// add event listener to update cords and zoom if user changed it
addEventListener(LEAFLET_MAP_EVENT, (event: LeafletMapEvent) => {
    if (event.mapId != MAIN_MAP_ID) {
        return;
    }

    const cordsAndZoom: LocalStorage.Types.MapCordsAndZoom = { cords: event.latLng, zoom: event.zoom };
    localStorage.setItem(LocalStorage.Keys.MAP_CORDS_AND_ZOOM, JSON.stringify(cordsAndZoom));
});

const EMPTY_NOTAM_DATA = { version: "0.0", notams: [], coordinatesLists: [] };

export interface AppData {
    country: string | null;
    displayedNotamData: NotamData;
    loadedNotams: number;
    mapCordsAndZoom: LocalStorage.Types.MapCordsAndZoom;
    filterOptions: NotamFilterOptions;
    setCountry: (country: string) => void;
    setFilterOptions: (filter: NotamFilterOptions) => void;
}

export interface AppDataLayerProps {
    onDataChange: (appData: AppData) => void;
}

export function AppDataLayer({ onDataChange }: AppDataLayerProps) {
    // cords and zoom only to update map (fly to) does not necessarily represent the actual current cords or zoom (user changed it)
    // persistence is achieved with the leaflet map event the contents of which are directly written to local storage for availability after reload
    // see above event listener
    const [mapCordsAndZoom, setMapCordsAndZoom] = useLocalStorage<LocalStorage.Types.MapCordsAndZoom>(
        { cords: [49, 12], zoom: 5 },
        LocalStorage.Keys.MAP_CORDS_AND_ZOOM
    );

    const [country, _setCountry] = useLocalStorage<string | null>(null, LocalStorage.Keys.DATA_COUNTRY);
    const [filter, setFilter] = useLocalStorage<NotamFilterOptions>(defaultFilterOptions, LocalStorage.Keys.DATA_FILTER);

    const [notamData, setNotamData] = useState<NotamData | null>(null);
    const [displayedNotamData, setDisplayedNotamData] = useState<NotamData>(EMPTY_NOTAM_DATA);

    async function onCountryChange(country: string, isInitialChange = false) {
        const newNotamData = await fetchNotamData(country);

        _setCountry(country);

        // do not trigger coordinates change if it is the first change of country (initial load to update country data only, see use effect)
        if (!isInitialChange && (countryCenterData as any)[country]) {
            setMapCordsAndZoom({ cords: (countryCenterData as any)[country], zoom: 7 });
        }

        if (newNotamData?.version == "1.0") {
            setNotamData(newNotamData);
        } else {
            alert(
                "Notamdata for " + country + " is on version " + newNotamData.version + ", but the app currently only supports version 1.0."
            );
        }
    }

    useEffect(() => {
        if (country) {
            onCountryChange(country, true);
        }
    }, []);

    useEffect(() => {
        if (notamData != null) {
            setDisplayedNotamData(filterNotamData(notamData, filter));
        }
    }, [notamData, filter]);

    useEffect(() => {
        console.log("Updating app data...");
        onDataChange({
            country,
            loadedNotams: notamData?.notams.length ?? 0,
            displayedNotamData,
            mapCordsAndZoom,
            setCountry: onCountryChange,
            setFilterOptions: setFilter,
            filterOptions: filter,
        });
    }, [country, displayedNotamData, mapCordsAndZoom]);

    return null;
}
