import { ReactPortal, useCallback, useEffect, useRef, useState } from "react";
import { LeafletMap } from "../LeafletMap";
import * as L from "leaflet";
import { Coordinates, CoordinatesList, DetailedNotam, NotamData } from "../../notams/notamextractor";
import { CoordinatesRenderer, NotamRenderer } from "./notamDisplayHelpers";

export interface NotamMapProps {
    /**
     * The notam data to display on the map.
     * Must be already filtered (both notams and coordinates),
     */
    notamData: NotamData;
    notamRenderer: NotamRenderer;
    coordinatesRenderer: CoordinatesRenderer;
    /**
     * The current/initial cords. Changing this causes the map to switch to these coordinates.
     */
    currentCords: L.LatLngTuple;

    /**
     * The current/initial zoom. Changing this causes the map to switch to this zoom level.
     */
    currentZoom: number;
}

export function NotamMap({ notamData, notamRenderer, coordinatesRenderer, currentCords, currentZoom }: NotamMapProps) {
    // set portal for the currently displayed notam
    const [portal, setPortal] = useState<ReactPortal>();
    const mapRef = useRef<L.Map | null>(null);

    const displayedNotams = useRef(new Set<L.Layer>());
    const displayedCoordinates = useRef(new Map<string, L.Layer>());

    const initMap = useCallback((map: L.Map) => {
        mapRef.current = map;
        initAeronauticalMap(map);
    }, []);

    useEffect(() => {
        if (mapRef.current != null) {
            updateNotams(mapRef.current, notamData.notams, displayedNotams.current, notamRenderer, setPortal);
        }
    }, [notamData, notamRenderer]);

    useEffect(() => {
        if (mapRef.current != null) {
            updateCoordinates(mapRef.current, notamData.coordinatesLists, displayedCoordinates.current, coordinatesRenderer);
        }
    }, [notamData, coordinatesRenderer]);

    return (
        <>
            <div className="inline-block w-full h-full">
                <LeafletMap onInit={initMap} currentCords={currentCords} currentZoom={currentZoom}></LeafletMap>
            </div>
            {portal}
        </>
    );
}

function updateCoordinates(
    map: L.Map,
    coordinateLists: CoordinatesList[],
    displayedCoordinatesList: Map<string, L.Layer>,
    coordinatesRenderer: CoordinatesRenderer
) {
    console.log("Rendering " + coordinateLists.length + " coordinates...");

    const remainingCoordiantes = new Map<string, CoordinatesList>();
    for (const coordinatesList of coordinateLists) {
        remainingCoordiantes.set(coordinatesList.hash, coordinatesList);
    }

    for (const displayedCoordinates of displayedCoordinatesList) {
        if (!remainingCoordiantes.delete(displayedCoordinates[0])) {
            map.removeLayer(displayedCoordinates[1]);
        }
    }

    for (const coordinates of remainingCoordiantes) {
        const layer = coordinatesRenderer(coordinates[1]);
        if (layer != null) {
            map.addLayer(layer);
            displayedCoordinatesList.set(coordinates[0], layer);
        }
    }
}

function updateNotams(
    map: L.Map,
    notams: DetailedNotam[],
    displayedNotams: Set<L.Layer>,
    notamRenderer: NotamRenderer,
    setPortal: (portal: ReactPortal) => void
) {
    console.log("Rendering " + notams.length + " notams...");

    for (const layer of displayedNotams) {
        map.removeLayer(layer);
    }
    displayedNotams.clear();

    //                          lat         lng     notams
    const notamGroups = new Map<number, Map<number, DetailedNotam[]>>();

    for (const detailedNotam of notams) {
        const notam = detailedNotam.notam;

        let lngMap = notamGroups.get(notam.latitude);

        if (lngMap == null) {
            lngMap = new Map();
            notamGroups.set(notam.latitude, lngMap);
        }

        let filteredNotams = lngMap.get(notam.longitude);

        if (filteredNotams == null) {
            filteredNotams = [];
            lngMap.set(notam.longitude, filteredNotams);
        }

        filteredNotams.push(detailedNotam);
    }

    for (const lngMap of notamGroups) {
        for (const notams of lngMap[1]) {
            const layer = notamRenderer(notams[1], map, setPortal);
            map.addLayer(layer);
            displayedNotams.add(layer);
        }
    }
}

function initAeronauticalMap(map: L.Map) {
    const maxZoom = 14;

    const osmMap = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom,
        attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        opacity: 0.6,
    });

    const osmHOTMap = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        maxZoom,
        attribution:
            '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://wiki.openstreetmap.org/wiki/HOT_style">HOT style</a>',
        opacity: 0.6,
    });

    const openTopoMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom,
        attribution:
            '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://opentopomap.org/">OpenTopoMap</a>',
        opacity: 0.6,
    });

    // OpenAIP layer uses proxy
    const openAipTileLayerUrl = import.meta.env.VITE_OPENAPI_TILE_LAYER_URL;
    const openAipMap = L.tileLayer(openAipTileLayerUrl, {
        maxZoom,
        minZoom: 7,
        attribution: '<a href="https://www.openaip.net">OpenAIP</a>',
    });

    const baseMaps = {
        Standard: osmMap,
        Humanitarian: osmHOTMap,
        Topographic: openTopoMap,
    };

    const overlayMaps = {
        "Aeronautical Data": openAipMap,
    };

    // add to map

    L.control.layers(baseMaps, overlayMaps).setPosition("topleft").addTo(map);
    osmMap.addTo(map); // added first to have the correct ordering in the map attribution
    osmHOTMap.addTo(map);
    openTopoMap.addTo(map);
    openAipMap.addTo(map);

    // initially remove the layers (only osm hot map base layer)
    map.removeLayer(osmMap);
    map.removeLayer(openTopoMap);
}
