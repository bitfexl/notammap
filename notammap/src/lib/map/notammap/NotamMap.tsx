import { ReactPortal, memo, useCallback, useEffect, useRef, useState } from "react";
import { LeafletMap } from "../LeafletMap";
import * as L from "leaflet";
import { Notam } from "../../notams/notamextractor";
import { NotamFilter, NotamMarkerProducer } from "./NotamDisplayHelpers";

export interface NotamMapProps {
    notams: Notam[];
    filter: NotamFilter;
    markerProducer: NotamMarkerProducer;
    initialCoords: L.LatLngTuple;
    initialZoom: number;
}

export const NotamMap = memo(function NotamMap({ notams, filter, markerProducer, initialCoords, initialZoom }: NotamMapProps) {
    const [portals, setPortals] = useState<ReactPortal[]>([]);
    const mapRef = useRef<L.Map>(null);
    const displayedNotams = useRef(new Set<L.Layer>());

    const initMap = useCallback((map: L.Map) => {
        displayedNotams.current.clear();
        initAeronauticalMap(map, initialCoords, initialZoom);
    }, []);

    useEffect(() => {
        if (mapRef.current != null) {
            setPortals(updateNotams(mapRef.current, notams, displayedNotams.current, filter, markerProducer));
        } else {
            displayedNotams.current.clear();
        }
    }, [notams, filter, markerProducer]);

    return (
        <>
            <div className="inline-block w-full h-full">
                <LeafletMap ref={mapRef} init={initMap}></LeafletMap>
            </div>
            {portals}
        </>
    );
});

function updateNotams(
    map: L.Map,
    notams: Notam[],
    displayedNotams: Set<L.Layer>,
    filter: NotamFilter,
    markerProducer: NotamMarkerProducer
) {
    console.log("Updating " + notams.length + " notams...");
    for (const layer of displayedNotams) {
        map.removeLayer(layer);
    }
    displayedNotams.clear();
    const portals: ReactPortal[] = [];

    //                          lat         lng     notams
    const notamGroups = new Map<number, Map<number, Notam[]>>();

    for (const notam of notams.filter(filter)) {
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

    notamGroups.forEach((lngMap) => {
        lngMap.forEach((notams) => {
            const [layer, portal] = markerProducer(notams, map);
            displayedNotams.add(layer);

            if (portal != null) {
                portals.push(portal);
            }
        });
    });

    return portals;
}

function initAeronauticalMap(map: L.Map, center: L.LatLngTuple, zoom: number) {
    const openAipApiKey = import.meta.env.VITE_OPENAPI_API_KEY;

    // create map layers

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

    const openAipMap = L.tileLayer("https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png?apiKey=" + openAipApiKey, {
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

    map.setView(center, zoom);
    L.control.layers(baseMaps, overlayMaps).setPosition("topleft").addTo(map);
    osmMap.addTo(map); // added first to have the correct ordering in the map attribution
    osmHOTMap.addTo(map);
    openTopoMap.addTo(map);
    openAipMap.addTo(map);

    // initially remove the layers (only osm hot map base layer)
    map.removeLayer(osmMap);
    map.removeLayer(openTopoMap);
}
