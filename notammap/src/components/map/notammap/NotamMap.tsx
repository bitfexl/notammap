import { ReactPortal, useEffect, useRef, useState } from "react";
import { Layer, LeafletMap } from "../LeafletMap";
import * as L from "leaflet";
import { CoordinatesList, DetailedNotam, NotamData } from "../../../api/notams/notamextractor";
import { createPortal } from "react-dom";
import { NotamListComponent } from "../../notam/NotamListComponent";
import { CoordinatesRenderer, NotamRenderer } from "./notamMapRenderers";
import countryCenterData from "../../../assets/countryCenterData.json";
import { reversedCountryCodes } from "../../../assets/computedAssets";
import { canvasMarker } from "../plugins/CanvasMarker";

export interface NotamMapProps {
    /**
     * The notam data to display on the map.
     * Must be already filtered (both notams and coordinates),
     */
    notamData: NotamData;
    notamRenderer: NotamRenderer;
    coordinatesRenderer: CoordinatesRenderer;
    /**
     * Unique map id for events.
     */
    mapId: string;

    /**
     * The new/initial cords. Changing this causes the map to switch to these coordinates. Does not reflect cords if user moves the map.
     */
    newCords: L.LatLngTuple;

    /**
     * The new/initial zoom. Changing this causes the map to switch to this zoom level. Does not reflect zoom if user zooms the map.
     */
    newZoom: number;

    /**
     * Executed when a notams marker is clicked.
     * @param notams The notams displayed by the marker.
     * @returns true: show popup with notams on map, false: do not show popup;
     */
    onNotamsClick: (notams: DetailedNotam[]) => boolean;

    /**
     * Executed when coordinates marker is clicked.
     * @param coordinates The clicked coordinates.
     */
    onCooridnatesClick: (coordinates: CoordinatesList) => void;

    /**
     * Available countries.
     */
    countries: string[];

    /**
     * The currently selected country.
     */
    currentCountry: string | null;

    /**
     * Called when a country marker is clicked.
     * @param country The newly selected country.
     */
    onCountryClick: (country: string) => void;
}

export function NotamMap({
    notamData,
    notamRenderer,
    coordinatesRenderer,
    newCords,
    newZoom,
    onNotamsClick,
    onCooridnatesClick,
    mapId,
    countries,
    currentCountry,
    onCountryClick,
}: NotamMapProps) {
    // set portal for the currently displayed notam
    const [portal, setPortal] = useState<ReactPortal>();
    const mapRef = useRef<L.Map | null>(null);

    function initMap(map: L.Map) {
        mapRef.current = map;
    }

    useEffect(() => {
        return setLayer(mapRef, renderSelectCountryLayer(countries, currentCountry, onCountryClick));
    }, [countries, onCountryClick]);

    useEffect(() => {
        return setLayer(mapRef, renderCoordinatesLayer(notamData.coordinatesLists, coordinatesRenderer, onCooridnatesClick));
    }, [notamData, coordinatesRenderer, onCooridnatesClick]);

    useEffect(() => {
        if (mapRef.current != null) {
            return setLayer(mapRef, renderNotamsLayer(mapRef.current, notamData.notams, notamRenderer, setPortal, onNotamsClick));
        }
    }, [notamData, notamRenderer, onNotamsClick]);

    return (
        <>
            <LeafletMap mapId={mapId} onInit={initMap} newCords={newCords} newZoom={newZoom} layers={LAYERS}></LeafletMap>
            {portal}
        </>
    );
}

// TODO: get rid of this, onclick does not work with default renderer
const leafletDataLayerRenderer = L.canvas({ padding: 1 });

function renderCoordinatesLayer(
    coordinateLists: CoordinatesList[],
    coordinatesRenderer: CoordinatesRenderer,
    onCooridnatesClick: (coordinatesList: CoordinatesList) => void
) {
    console.log("Rendering " + coordinateLists.length + " coordinates...");

    const finalLayer = L.layerGroup();

    for (const coordinates of coordinateLists) {
        const layer = coordinatesRenderer(
            coordinates,
            () => {
                onCooridnatesClick(coordinates);
            },
            leafletDataLayerRenderer
        );
        if (layer != null) {
            finalLayer.addLayer(layer);
        }
    }

    return finalLayer;
}

function renderNotamsLayer(
    map: L.Map,
    notams: DetailedNotam[],
    notamRenderer: NotamRenderer,
    setPortal: (portal: ReactPortal) => void,
    onNoatmsClick: (notams: DetailedNotam[]) => boolean
) {
    console.log("Rendering " + notams.length + " notams...");

    //                          lat         lng     notams
    const notamGroups = new Map<number, Map<number, DetailedNotam[]>>();

    // TODO: properly handle when latitude or longitude are missing (display to user)
    // DOES HAPPEN e.g. with some notams in canada

    for (const detailedNotam of notams) {
        const notam = detailedNotam.notam;

        let lngMap = notamGroups.get(notam.latitude ?? 0);

        if (lngMap == null) {
            lngMap = new Map();
            notamGroups.set(notam.latitude ?? 0, lngMap);
        }

        let filteredNotams = lngMap.get(notam.longitude ?? 0);

        if (filteredNotams == null) {
            filteredNotams = [];
            lngMap.set(notam.longitude ?? 0, filteredNotams);
        }

        filteredNotams.push(detailedNotam);
    }

    const foregroundMarkers: [L.LatLngTuple, L.Layer][] = [];
    const backgroundMarkers: [L.LatLngTuple, L.Layer][] = [];

    for (const [lat, lngNotams] of notamGroups) {
        for (const [lng, notams] of lngNotams) {
            const latLng: L.LatLngTuple = [lat, lng];
            const layers = notamRenderer(
                notams,
                () => {
                    if (onNoatmsClick(notams)) {
                        const content = document.createElement("div");
                        content.style.minWidth = "300px";
                        L.popup().setLatLng(latLng).setContent(content).openOn(map);

                        const portal = createPortal(
                            <div className="max-h-[80vh] overflow-auto ">
                                <NotamListComponent detailedNotams={notams}></NotamListComponent>
                            </div>,
                            content
                        );
                        setPortal(portal);
                    }
                },
                leafletDataLayerRenderer
            );

            if (layers[0]) {
                foregroundMarkers.push([latLng, layers[0]]);
            }
            if (layers[1]) {
                backgroundMarkers.push([latLng, layers[1]]);
            }
        }
    }

    [foregroundMarkers, backgroundMarkers].forEach((ms) =>
        ms.sort((a, b) => {
            const x = b[0][0] - a[0][0];
            if (x != 0) {
                return x;
            }
            return b[0][1] - a[0][1];
        })
    );

    const finalLayer = L.layerGroup();

    backgroundMarkers.forEach((m) => finalLayer.addLayer(m[1]));
    foregroundMarkers.forEach((m) => finalLayer.addLayer(m[1]));

    return finalLayer;
}

function renderSelectCountryLayer(countries: string[], currentCountry: string | null, onClick: (country: string) => void): L.Layer {
    const layer = L.layerGroup();
    for (const country of countries) {
        if (country == currentCountry) {
            continue; // do not show marker for current country
        }
        const center = (countryCenterData as any)[country];
        if (!center) {
            continue;
        }
        const marker = canvasMarker(center, {
            renderer: leafletDataLayerRenderer,
            img: {
                size: [32, -1],
                url: "flags/" + reversedCountryCodes[country]?.toLowerCase() + ".svg",
            },
        });
        marker.on("click", () => onClick(country));
        layer.addLayer(marker);
    }
    return layer;
}

// set updated layer inside use effect
function setLayer(ref: { current: L.Map | null }, layer: L.Layer): () => void {
    if (ref.current) {
        ref.current.addLayer(layer);
    }

    return () => {
        if (ref.current) {
            ref.current.removeLayer(layer);
        }
    };
}

const maxZoom = 14;
const minZoom = 0;

// TODO: save currently selected layer in local storage

const LAYERS: Layer[] = [
    {
        tmsUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        name: "Standard",
        type: "base",
        maxZoom,
        minZoom,
        opacity: 0.6,
        attributions: [
            {
                name: "OpenStreetMap",
                url: "http://www.openstreetmap.org/copyright",
            },
        ],
    },
    {
        tmsUrl: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        name: "Humanitarian",
        type: "base",
        defaultActive: true,
        maxZoom,
        minZoom,
        opacity: 0.6,
        attributions: [
            {
                name: "OpenStreetMap",
                url: "http://www.openstreetmap.org/copyright",
            },
            {
                name: "HOT style",
                url: "https://wiki.openstreetmap.org/wiki/HOT_style",
            },
        ],
    },
    {
        tmsUrl: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        name: "Topographic",
        type: "base",
        maxZoom,
        minZoom,
        opacity: 0.6,
        attributions: [
            {
                name: "OpenStreetMap",
                url: "http://www.openstreetmap.org/copyright",
            },
            {
                name: "OpenTopoMap",
                url: "https://opentopomap.org/",
            },
        ],
    },
    {
        tmsUrl: import.meta.env.VITE_SATELLITE_TILE_LAYER_URL,
        name: "Satellite",
        type: "base",
        maxZoom,
        minZoom,
        opacity: 0.6,
        attributions: [
            {
                name: "Esri (Satellite Imagery)",
                url: "https://www.esri.com/",
            },
        ],
    },
    {
        tmsUrl: import.meta.env.VITE_OPENAIP_TILE_LAYER_URL,
        name: "Aeronautical Data",
        type: "annotation",
        defaultActive: true,
        maxZoom,
        minZoom: 7,
        opacity: 1,
        attributions: [
            {
                name: "OpenAIP",
                url: "https://www.openaip.net/",
            },
        ],
    },
];
