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
    const displayedNotams = useRef(new Map<Notam, L.Layer>());

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
        <div className="inline-block w-[600px] h-[600px]">
            <LeafletMap ref={mapRef} init={initMap}></LeafletMap>
        </div>
    );
});

function updateNotams(
    map: L.Map,
    notams: Notam[],
    displayedNotams: Map<Notam, L.Layer>,
    filter: NotamFilter,
    markerProducer: NotamMarkerProducer
) {
    console.log("Updating " + notams.length + " notams...");
    let removedCount = 0;

    for (const oldNotam of displayedNotams.keys()) {
        if (!notams.includes(oldNotam) || !filter(oldNotam)) {
            map.removeLayer(displayedNotams.get(oldNotam) as L.Layer);
            displayedNotams.delete(oldNotam);
            removedCount++;
        }
    }

    console.log("Removed " + removedCount + " notams.");
    let addedCount = 0;

    for (const notam of notams.filter(filter)) {
        if (!displayedNotams.has(notam)) {
            // TODO: group
            displayedNotams.set(notam, createMarker(map, notam, markerProducer));
            addedCount++;
        }
    }

    console.log("Added " + addedCount + " notams.");
}

function createMarker(map: L.Map, notam: Notam, markerProducer: NotamMarkerProducer): L.Layer {
    return markerProducer([notam], map);
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
