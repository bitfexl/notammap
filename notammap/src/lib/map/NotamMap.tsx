import { useCallback, useEffect, useRef } from "react";
import { LeafletMap } from "./LeafletMap";
import * as L from "leaflet";
import { Notam } from "../notams/notamextractor";

/**
 * One nautical mile in meters.
 */
const NM_TO_M = 1852;

export interface NotamMapProps {
    notams: Notam[];
}

export function NotamMap({ notams }: NotamMapProps) {
    const mapRef = useRef<L.Map>(null);
    const displayedNotams = useRef(new Map<Notam, L.Layer>());

    const initMap = useCallback((map: L.Map) => initAeronauticalMap(map, [52.351603163346255, 13.494656170576595], 9), []);

    useEffect(() => {
        if (mapRef.current != null) {
            updateNotams(mapRef.current, notams, displayedNotams.current);
        } else {
            displayedNotams.current.clear();
        }
    });

    return (
        <div className="inline-block w-[600px] h-[600px]">
            <LeafletMap ref={mapRef} init={initMap}></LeafletMap>
        </div>
    );
}

function updateNotams(map: L.Map, notams: Notam[], displayedNotams: Map<Notam, L.Layer>) {
    console.log("Updating " + notams.length + " notams...");
    let removedCount = 0;

    for (const oldNotam of displayedNotams.keys()) {
        if (!notams.includes(oldNotam)) {
            map.removeLayer(displayedNotams.get(oldNotam) as L.Layer);
            displayedNotams.delete(oldNotam);
            removedCount++;
        }
    }

    console.log("Removed " + removedCount + " notams.");
    let addedCount = 0;

    for (const notam of notams) {
        if (!displayedNotams.has(notam)) {
            displayedNotams.set(notam, createMarker(map, notam));
            addedCount++;
        }
    }

    console.log("Added " + addedCount + " notams.");
}

function createMarker(map: L.Map, notam: Notam): L.Layer {
    const latlng: L.LatLngTuple = [notam.latitude, notam.longitude];
    const radius = notam.radius * NM_TO_M;

    const marker = L.marker(latlng);
    const circle = L.circle(latlng, { radius });

    const openPoupu = () => {
        const content = document.createElement("p");
        content.innerText = notam.notamText;
        L.popup().setLatLng(latlng).setContent(content).openOn(map);
    };

    marker.on("click", openPoupu);
    circle.on("click", openPoupu);

    const finalLayer = L.layerGroup();
    finalLayer.addLayer(marker);

    // do not show radius for notams with radius > 10km
    // TODO: more filter options
    if (radius < 10000) {
        finalLayer.addLayer(circle);
    }

    finalLayer.addTo(map);
    return finalLayer;
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
