import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { useEffect, useRef, useState } from "react";
import layersIcon from "../../assets/icons/layers.svg?raw";
import closeIcon from "../../assets/icons/x.svg?raw";
import zoomOutIcon from "../../assets/icons/zoom-out.svg?raw";
import zoomInIcon from "../../assets/icons/zoom-in.svg?raw";
import gpsLocateIcon from "../../assets/icons/gps-locate.svg?raw";
import { boxShadowStyle } from "../componentConstants";
import { IconButton } from "../form/IconButton";

/**
 * The name of the leaflet map event which is always dispatched on the window.
 */
export const LEAFLET_MAP_EVENT = "LeafletMapEvent";

/**
 * The leaflet map event when zoom or position changes on a map.
 * Map ID is currently not implemented.
 */
export class LeafletMapEvent extends Event {
    readonly mapId: string;

    readonly latLng: L.LatLngTuple;

    readonly zoom: number;

    constructor(mapId: string, latLng: L.LatLngTuple, zoom: number) {
        super(LEAFLET_MAP_EVENT);
        this.mapId = mapId;
        this.latLng = latLng;
        this.zoom = zoom;
    }
}

declare global {
    interface WindowEventMap {
        [LEAFLET_MAP_EVENT]: LeafletMapEvent;
    }
}

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
     * Unique map id for events.
     */
    mapId: string;

    /**
     * Called once when the map is initialized. Add layers and stuff here.
     * A reference to the map can also be saved.
     * @param map The leaflet map created.
     */
    onInit: (map: L.Map) => void;

    /**
     * The new/initial cords. Changing this causes the map to switch to these coordinates. Does not reflect cords if user moves the map.
     */
    newCords: L.LatLngTuple;

    /**
     * The new/initial zoom. Changing this causes the map to switch to this zoom level. Does not reflect zoom if user zooms the map.
     */
    newZoom: number;

    /**
     * The layers of the map. Should not change.
     */
    layers: Layer[];
}

export function LeafletMap({ onInit, newCords, newZoom, layers: rawLayers, mapId }: LeafletMapProps) {
    // filter if tms url provided through env variable is not provided
    const layers = rawLayers.filter((l) => l.tmsUrl != null && l.tmsUrl != "");

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

            map.setView(newCords, newZoom);

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
                const pos = map.getCenter();
                dispatchEvent(new LeafletMapEvent(mapId, [pos.lat, pos.lng], map.getZoom()));
                setLayerSelectorOpen(false);
            }

            map.addEventListener("zoom", mapChangeEventListener);
            map.addEventListener("move", mapChangeEventListener);

            return () => {
                map.remove();
            };
        }
    }, [rawLayers]);

    useEffect(() => {
        if (mapRef.current != null) {
            mapRef.current.flyTo(newCords, newZoom);
        }
    }, [newCords, newZoom]);

    function locate() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                mapRef.current?.flyTo([position.coords.latitude, position.coords.longitude], 10);
            },
            (error) => {
                if (error.code == GeolocationPositionError.PERMISSION_DENIED) {
                    alert("You must allow geolocation access to determine your current location.");
                } else {
                    alert("Unable to determine your current location.");
                }
            }
        );
    }

    return (
        <>
            <div className="w-full h-full" ref={containerRef}></div>
            {mapRef.current && (
                <div className="fixed top-4 right-8 flex flex-col gap-4 z-[999]">
                    <MapButton svgIcon={zoomInIcon} onClick={() => mapRef.current?.zoomIn()}></MapButton>
                    <MapButton svgIcon={zoomOutIcon} onClick={() => mapRef.current?.zoomOut()}></MapButton>
                    {"geolocation" in navigator && <MapButton svgIcon={gpsLocateIcon} onClick={locate}></MapButton>}
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
        <div className="flex flex-col gap-2">
            <div className="text-right z-10" style={{ lineHeight: "0" }}>
                <IconButton
                    onClick={() => setOpen(!open)}
                    svgIcon={open ? closeIcon : layersIcon}
                    connected={open ? "bottom-left" : "none"}
                ></IconButton>
            </div>
            {open && (
                <div className="flex flex-col gap-2 bg-white rounded-md p-2 pt-4 rounded-tr-none" style={boxShadowStyle}>
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
    const map = L.map(container, {
        zoomControl: false,
        maxBounds: [
            [90, 99999],
            [-90, -99999],
        ],
        maxBoundsViscosity: 1,
        worldCopyJump: true,
        // preferCanvas: true,
    });
    L.control.scale({ imperial: false, position: "bottomright" }).addTo(map);
    return map;
}

function createLayer(layer: Layer): L.TileLayer {
    return L.tileLayer(layer.tmsUrl, {
        maxZoom: layer.maxZoom,
        minZoom: layer.minZoom,
        opacity: layer.opacity,
        attribution: layer.attributions.map((a) => `<a href="${a.url}" target="_blank" rel="noreferrer">${a.name}</a>`).join(", "),
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
