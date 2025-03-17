import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { useEffect, useRef } from "react";

export interface LeafletMapProps {
    /**
     * Called once when the map is initialized. Add layers and stuff here.
     * A reference to the map can also be saved.
     * @param map The leaflet map created.
     */
    onInit: (map: L.Map) => void;

    /**
     * The current/initial cords. Changing this causes the map to switch to these coordinates.
     */
    currentCords: L.LatLngTuple;

    /**
     * The current/initial zoom. Changing this causes the map to switch to this zoom level.
     */
    currentZoom: number;
}

export function LeafletMap({ onInit, currentCords, currentZoom }: LeafletMapProps) {
    const containerRef = useRef(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (containerRef.current != null) {
            const map = createMap(containerRef.current);
            mapRef.current = map;

            map.setView(currentCords, currentZoom);

            onInit(map);

            return () => {
                map.remove();
            };
        }
    }, [onInit]);

    useEffect(() => {
        if (mapRef.current != null) {
            mapRef.current.flyTo(currentCords, currentZoom);
        }
    }, [currentCords, currentZoom]);

    return (
        <>
            <div className="w-full h-full" ref={containerRef}></div>
        </>
    );
}

function createMap(container: HTMLDivElement) {
    const map = L.map(container);
    return map;
}
