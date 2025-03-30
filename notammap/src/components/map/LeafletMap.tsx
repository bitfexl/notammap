import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { SVGIcon } from "../icons/SVGIcon";
import layersIcon from "../../assets/icons/layers.svg?raw";
import closeIcon from "../../assets/icons/x.svg?raw";
import zoomOutIcon from "../../assets/icons/zoom-out.svg?raw";
import zoomInIcon from "../../assets/icons/zoom-in.svg?raw";
import gpsLocateIcon from "../../assets/icons/gps-locate.svg?raw";
import { boxShadowStyle } from "../componentConstants";
import { IconButton } from "../form/IconButton";

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

    const [layerSelectorOpen, setLayerSelectorOpen] = useState(false);

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

            function mapChangeEventListener() {
                setLayerSelectorOpen(false);
            }

            map.addEventListener("zoom", mapChangeEventListener);
            map.addEventListener("move", mapChangeEventListener);

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
            <div className="w-full h-full -z-[9999]" ref={containerRef}></div>
            {mapRef.current && (
                <div className="fixed top-4 right-8 flex flex-col gap-4">
                    <MapButton svgIcon={zoomInIcon} onClick={() => mapRef.current?.zoomIn()}></MapButton>
                    <MapButton svgIcon={zoomOutIcon} onClick={() => mapRef.current?.zoomOut()}></MapButton>
                    <MapButton svgIcon={gpsLocateIcon} onClick={() => alert("not yet implemented")}></MapButton>
                    <LayerSelector
                        layers={layers}
                        layerStatus={layerStatus}
                        setLayerStatus={setLayerStatus}
                        map={mapRef.current}
                        open={layerSelectorOpen}
                        setOpen={setLayerSelectorOpen}
                    ></LayerSelector>
                </div>
            )}
        </>
    );
}

function MapButton({ svgIcon, onClick }: { svgIcon: string; onClick: () => void }) {
    return (
        <div className="text-right" style={{ lineHeight: "0" }}>
            <IconButton svgIcon={svgIcon} onClick={onClick}></IconButton>
        </div>
    );
}

function LayerSelector({
    layers,
    layerStatus,
    setLayerStatus,
    map,
    open,
    setOpen,
}: {
    layers: Layer[];
    layerStatus: boolean[];
    setLayerStatus: (layerIndex: number, active: boolean) => void;
    map: L.Map;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    return (
        <div className="flex flex-col gap-0">
            <div className="text-right z-10" style={{ lineHeight: "0" }}>
                <button
                    className={`nostyle inline-block rounded-t-md w-10 h-10 bg-white ${!open && "rounded-b-md"}`}
                    style={boxShadowStyle}
                    onClick={() => setOpen(!open)}
                >
                    <div className="p-2">
                        <SVGIcon svg={open ? closeIcon : layersIcon}></SVGIcon>
                    </div>
                    {open && (
                        <div
                            className="w-full h-[5px] bg-white"
                            style={{
                                boxShadow: "-5px 0 0px white",
                            }}
                        ></div>
                    )}
                </button>
            </div>
            {open && (
                <div className="flex flex-col gap-2 bg-white rounded-md p-2 rounded-tr-none" style={boxShadowStyle}>
                    {layers.map((layer, index) => (
                        <div key={layer.name} className="text-center flex flex-col">
                            <div>
                                <button
                                    className={`nostyle inline-block w-16 h-16 border-2 rounded-md overflow-hidden ${
                                        layerStatus[index] && "border-gray-700"
                                    }`}
                                    onClick={() => {
                                        setLayerStatus(index, layer.type == "base" ? true : !layerStatus[index]);
                                        setOpen(false);
                                    }}
                                >
                                    <img className="w-full h-full" src={getPreviewSrc(layer.tmsUrl, map)} alt="Layer Preview" />
                                </button>
                            </div>
                            <p className="text-xs select-none" style={{ maxWidth: "80px" }}>
                                {layer.name}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function getPreviewSrc(tmsUrl: string, map: L.Map) {
    const zoom = 7;
    const center = map.getCenter();

    const x = lon2tile(center.lng, zoom);
    const y = lat2tile(center.lat, zoom);

    tmsUrl = tmsUrl.replace("{s}", "a");
    tmsUrl = tmsUrl.replace("{z}", zoom.toString());
    tmsUrl = tmsUrl.replace("{x}", Math.round(x).toString());
    tmsUrl = tmsUrl.replace("{y}", Math.round(y).toString());

    return tmsUrl;
}

function createMap(container: HTMLDivElement) {
    const map = L.map(container, { zoomControl: false });
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

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames

function lon2tile(lon: number, zoom: number) {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat: number, zoom: number) {
    return Math.floor(
        ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom)
    );
}
