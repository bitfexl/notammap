import { ReactPortal, useCallback, useEffect, useRef, useState } from "react";
import { LeafletMap } from "../LeafletMap";
import * as L from "leaflet";
import { Notam } from "../../notams/notamextractor";
import { NotamRenderer } from "./notamDisplayHelpers";

export interface NotamMapProps {
    notams: Notam[];
    notamRenderer: NotamRenderer;
    /**
     * The current/initial cords. Changing this causes the map to switch to these coordinates.
     */
    currentCords: L.LatLngTuple;

    /**
     * The current/initial zoom. Changing this causes the map to switch to this zoom level.
     */
    currentZoom: number;
}

export function NotamMap({ notams, notamRenderer, currentCords, currentZoom }: NotamMapProps) {
    // set portal for the currently displayed notam
    const [portal, setPortal] = useState<ReactPortal>();
    const mapRef = useRef<L.Map | null>(null);
    const displayedNotams = useRef(new Set<L.Layer>());

    const initMap = useCallback((map: L.Map) => {
        mapRef.current = map;
        initAeronauticalMap(map);
    }, []);

    useEffect(() => {
        if (mapRef.current != null) {
            updateNotams(mapRef.current, notams, displayedNotams.current, notamRenderer, setPortal);
        }
    }, [notams, notamRenderer]);

    return (
        <>
            <div className="inline-block w-full h-full">
                <LeafletMap onInit={initMap} currentCords={currentCords} currentZoom={currentZoom}></LeafletMap>
            </div>
            {portal}
        </>
    );
}

function updateNotams(
    map: L.Map,
    notams: Notam[],
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
    const notamGroups = new Map<number, Map<number, Notam[]>>();

    for (const notam of notams) {
        let lngMap = notamGroups.get(notam.latitude);

        if (lngMap == null) {
            lngMap = new Map();
            notamGroups.set(notam.latitude, lngMap);
        }

        let notams = lngMap.get(notam.longitude);

        if (notams == null) {
            notams = [];
            lngMap.set(notam.longitude, notams);
        }

        notams.push(notam);
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
