import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { useEffect, useRef, useState } from "react";

export interface Layer {
    /**
     * The name of the layer.
     */
    name: string;
    /**
     * The layer type. Only one base layer can be selected at a time.
     * Annotation layers can be toggled on and of.
     */
    type: "base" | "annotation";
    /**
     * The tile map service url for leaflet.
     */
    tmsUrl: string;
    /**
     * The min zoom of the layer (for leaflet).
     */
    minZoom: number;
    /**
     * The max zoom of the layer (for leaflet).
     */
    maxZoom: number;
    /**
     * The opacity of the layer.
     */
    opacity: number;
    /**
     * Attributions for the layer data.
     */
    attributions: {
        name: string;
        url: string;
    }[];
    /**
     * Set to true if the layer should be active by default.
     */
    defaultActive?: boolean;
}

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

    /**
     * The layers of the map. Should not change.
     */
    layers: Layer[];
}

export function LeafletMap({ onInit, currentCords, currentZoom, layers }: LeafletMapProps) {
    const containerRef = useRef(null);
    const mapRef = useRef<L.Map | null>(null);
    const leafletLayers = useRef<L.TileLayer[]>([]);

    const [layerStatus, _setLayerStatus] = useState<boolean[]>([]);

    function setLayerStatus(layerIndex: number, active: boolean) {
        const newStatus = [...layerStatus];

        if (layerStatus[layerIndex] == active) {
            return;
        }

        if (active) {
            for (let i = 0; i < layers.length; i++) {
                if (layers[layerIndex].type == "base") {
                    mapRef.current?.removeLayer(leafletLayers.current[i]);
                }

                if (layers[layerIndex].type == "base" && layers[i].type == "base") {
                    newStatus[i] = false;
                }
            }

            newStatus[layerIndex] = true;

            for (let i = 0; i < layers.length; i++) {
                if (newStatus[i]) {
                    if (layers[layerIndex].type == "base" || layers[i].type == "annotation") {
                        mapRef.current?.addLayer(leafletLayers.current[i]);
                    }
                } else {
                    mapRef.current?.removeLayer(leafletLayers.current[i]);
                }
            }
        } else {
            mapRef.current?.removeLayer(leafletLayers.current[layerIndex]);
            newStatus[layerIndex] = false;
        }

        _setLayerStatus(newStatus);
    }

    useEffect(() => {
        if (containerRef.current != null) {
            const map = createMap(containerRef.current);
            mapRef.current = map;

            map.setView(currentCords, currentZoom);

            leafletLayers.current = [];

            for (const layer of layers) {
                const leafletLayer = createLayer(layer);
                map.addLayer(leafletLayer);
                leafletLayers.current.push(leafletLayer);
            }

            const layerStatus = [];

            for (let i = 0; i < layers.length; i++) {
                layerStatus.push(layers[i].defaultActive ?? false);
                if (!layers[i].defaultActive) {
                    map.removeLayer(leafletLayers.current[i]);
                }
            }

            _setLayerStatus(layerStatus);

            onInit(map);

            return () => {
                map.remove();
            };
        }
    }, [layers]);

    useEffect(() => {
        if (mapRef.current != null) {
            mapRef.current.flyTo(currentCords, currentZoom);
        }
    }, [currentCords, currentZoom]);

    return (
        <>
            <div className="w-full h-full" ref={containerRef}></div>
            <div className="fixed top-20 left-0 border border-red-500">
                {layers.map((layer, index) => (
                    <div id={layer.name}>
                        {layer.type == "base" ? (
                            <button onClick={() => setLayerStatus(index, true)}>
                                {layer.name} {layerStatus[index] && "(active)"}
                            </button>
                        ) : (
                            <button onClick={() => setLayerStatus(index, !layerStatus[index])}>
                                {layer.name} {layerStatus[index] ? "(shown)" : "(hidden)"}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}

function createMap(container: HTMLDivElement) {
    const map = L.map(container);
    return map;
}

function createLayer(layer: Layer): L.TileLayer {
    return L.tileLayer(layer.tmsUrl, {
        maxZoom: layer.maxZoom,
        minZoom: layer.minZoom,
        opacity: layer.opacity,
        attribution: layer.attributions.map((a) => `<a href="${a.url}">${a.name}</a>`).join(", "),
    });
}
