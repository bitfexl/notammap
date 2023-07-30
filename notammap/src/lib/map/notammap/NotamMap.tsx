import { memo, useCallback, useEffect, useRef } from "react";
import { LeafletMap } from "../LeafletMap";
import * as L from "leaflet";
import { Notam } from "../../notams/notamextractor";
import { NotamFilter, NotamMarkerProducer } from "./NotamDisplayHelpers";

export interface NotamMapProps {
    notams: Notam[];
    filter: NotamFilter;
    markerProducer: NotamMarkerProducer;
}

export const NotamMap = memo(function NotamMap({ notams, filter, markerProducer }: NotamMapProps) {
    const mapRef = useRef<L.Map>(null);
    const displayedNotams = useRef(new Set<L.Layer>());

    const initMap = useCallback((map: L.Map) => {
        displayedNotams.current.clear();
        initAeronauticalMap(map, [52.351603163346255, 13.494656170576595], 9);
    }, []);

    useEffect(() => {
        if (mapRef.current != null) {
            updateNotams(mapRef.current, notams, displayedNotams.current, filter, markerProducer);
        } else {
            displayedNotams.current.clear();
        }
    });

    return (
        <div className="inline-block w-full h-full">
            <LeafletMap ref={mapRef} init={initMap}></LeafletMap>
        </div>
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
            displayedNotams.add(createMarker(map, notams, markerProducer));
        });
    });
}

function createMarker(map: L.Map, notams: Notam[], markerProducer: NotamMarkerProducer): L.Layer {
    return markerProducer(notams, map);
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

    const osmHOTMap = L.tileLayer("https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        maxZoom,
        attribution:
            '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://wiki.openstreetmap.org/wiki/HOT_style">HOT style</a>',
        opacity: 0.6,
    });

    const openAipMap = L.tileLayer("https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png?apiKey=" + openAipApiKey, {
        maxZoom,
        attribution: '<a href="https://www.openaip.net">OpenAIP</a>',
    });

    const baseMaps = {
        Standard: osmMap,
        Humanitarian: osmHOTMap,
    };

    const overlayMaps = {
        "Aeronautical Data": openAipMap,
    };

    // add to map

    map.setView(center, zoom);
    L.control.layers(baseMaps, overlayMaps).setPosition("topleft").addTo(map);
    osmHOTMap.addTo(map);
    openAipMap.addTo(map);
}
