import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { forwardRef, useEffect, useRef } from "react";

export interface LeafletMapProps {
    /**
     * Called once when the map is initialized. Add layers and stuff here.
     * @param map The leaflet map created.
     */
    init: (map: L.Map) => void;
}

export const LeafletMap = forwardRef(function LeafletMap({ init }: LeafletMapProps, mapRef: any) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current != null) {
            const map = createMap(containerRef.current);
            mapRef.current = map;

            init(map);

            return () => {
                map.remove();
            };
        }
    }, [init]);

    return (
        <>
            <div className="w-full h-full" ref={containerRef}></div>
        </>
    );
});

function createMap(container: HTMLDivElement) {
    const map = L.map(container);
    return map;
}
