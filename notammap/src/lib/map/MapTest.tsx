import { useCallback, useRef } from "react";
import { LeafletMap } from "./LeafletMap";
import * as L from "leaflet";

export function MapTest() {
    const mapRef = useRef<L.Map>(null);

    const initMap = useCallback((map: L.Map) => {
        const center: L.LatLngTuple = [52.351603163346255, 13.494656170576595];
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

        map.setView(center, 9);
        L.control.layers(baseMaps, overlayMaps).setPosition("topleft").addTo(map);
        osmHOTMap.addTo(map);
        openAipMap.addTo(map);

        // create markers

        const marker = L.marker(center);
        const circle = L.circle(center, { radius: 800 });

        const openPoupu = () => {
            L.popup().setLatLng(center).setContent("<p>Hello world!<br />This is a nice popup.</p>").openOn(map);
        };

        marker.on("click", openPoupu);
        circle.on("click", openPoupu);

        marker.addTo(map);
        circle.addTo(map);
    }, []);

    return (
        <div className="inline-block w-[600px] h-[600px]">
            <LeafletMap ref={mapRef} init={initMap}></LeafletMap>
        </div>
    );
}
