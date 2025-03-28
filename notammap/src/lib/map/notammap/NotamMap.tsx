import { ReactPortal, useCallback, useEffect, useRef, useState } from "react";
import { LeafletMap } from "../LeafletMap";
import * as L from "leaflet";
import { CoordinatesList, DetailedNotam, Notam, NotamData } from "../../notams/notamextractor";
import { CoordinatesRenderer, NotamRenderer } from "./notamDisplayHelpers";
import { createPortal } from "react-dom";
import { NotamListComponent } from "../../notam/NotamListComponent";

export interface NotamMapProps {
    /**
     * The notam data to display on the map.
     * Must be already filtered (both notams and coordinates),
     */
    notamData: NotamData;
    notamRenderer: NotamRenderer;
    coordinatesRenderer: CoordinatesRenderer;
    /**
     * The current/initial cords. Changing this causes the map to switch to these coordinates.
     */
    currentCords: L.LatLngTuple;

    /**
     * The current/initial zoom. Changing this causes the map to switch to this zoom level.
     */
    currentZoom: number;

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
}

export function NotamMap({
    notamData,
    notamRenderer,
    coordinatesRenderer,
    currentCords,
    currentZoom,
    onNotamsClick,
    onCooridnatesClick,
}: NotamMapProps) {
    // set portal for the currently displayed notam
    const [portal, setPortal] = useState<ReactPortal>();
    const mapRef = useRef<L.Map | null>(null);

    const displayedNotams = useRef(new Set<L.Layer>());
    const displayedCoordinates = useRef(new Map<string, L.Layer>());

    const initMap = useCallback((map: L.Map) => {
        mapRef.current = map;
        initAeronauticalMap(map);
    }, []);

    useEffect(() => {
        if (mapRef.current != null) {
            updateNotams(mapRef.current, notamData.notams, displayedNotams.current, notamRenderer, setPortal, onNotamsClick);
        }
    }, [notamData, notamRenderer, onNotamsClick]);

    useEffect(() => {
        if (mapRef.current != null) {
            updateCoordinates(
                mapRef.current,
                notamData.coordinatesLists,
                displayedCoordinates.current,
                coordinatesRenderer,
                onCooridnatesClick
            );
        }
    }, [notamData, coordinatesRenderer, onCooridnatesClick]);

    return (
        <>
            <div className="inline-block w-full h-full">
                <LeafletMap onInit={initMap} currentCords={currentCords} currentZoom={currentZoom}></LeafletMap>
            </div>
            {portal}
        </>
    );
}

function updateCoordinates(
    map: L.Map,
    coordinateLists: CoordinatesList[],
    displayedCoordinatesList: Map<string, L.Layer>,
    coordinatesRenderer: CoordinatesRenderer,
    onCooridnatesClick: (coordinatesList: CoordinatesList) => void
) {
    console.log("Rendering " + coordinateLists.length + " coordinates...");

    const remainingCoordiantes = new Map<string, CoordinatesList>();
    for (const coordinatesList of coordinateLists) {
        remainingCoordiantes.set(coordinatesList.hash, coordinatesList);
    }

    for (const displayedCoordinates of displayedCoordinatesList) {
        if (!remainingCoordiantes.delete(displayedCoordinates[0])) {
            map.removeLayer(displayedCoordinates[1]);
            displayedCoordinatesList.delete(displayedCoordinates[0]);
        }
    }

    for (const [hash, coordinates] of remainingCoordiantes) {
        const layer = coordinatesRenderer(coordinates, () => {
            onCooridnatesClick(coordinates);
        });
        if (layer != null) {
            map.addLayer(layer);
            displayedCoordinatesList.set(hash, layer);
        }
    }
}

function updateNotams(
    map: L.Map,
    notams: DetailedNotam[],
    displayedNotams: Set<L.Layer>,
    notamRenderer: NotamRenderer,
    setPortal: (portal: ReactPortal) => void,
    onNoatmsClick: (notams: DetailedNotam[]) => boolean
) {
    console.log("Rendering " + notams.length + " notams...");

    for (const layer of displayedNotams) {
        map.removeLayer(layer);
    }
    displayedNotams.clear();

    //                          lat         lng     notams
    const notamGroups = new Map<number, Map<number, DetailedNotam[]>>();

    for (const detailedNotam of notams) {
        const notam = detailedNotam.notam;

        let lngMap = notamGroups.get(notam.latitude);

        if (lngMap == null) {
            lngMap = new Map();
            notamGroups.set(notam.latitude, lngMap);
        }

        let filteredNotams = lngMap.get(notam.longitude);

        if (filteredNotams == null) {
            filteredNotams = [];
            lngMap.set(notam.longitude, filteredNotams);
        }

        filteredNotams.push(detailedNotam);
    }

    for (const [lat, lngNotams] of notamGroups) {
        for (const [lng, notams] of lngNotams) {
            const layer = notamRenderer(notams, () => {
                if (onNoatmsClick(notams)) {
                    const content = document.createElement("div");
                    content.style.minWidth = "300px";
                    L.popup().setLatLng([lat, lng]).setContent(content).openOn(map);

                    const portal = createPortal(
                        <div className="max-h-[80vh] overflow-auto ">
                            <NotamListComponent detailedNotams={notams}></NotamListComponent>
                        </div>,
                        content
                    );
                    setPortal(portal);
                }
            });

            map.addLayer(layer);
            displayedNotams.add(layer);
        }
    }
}

function initAeronauticalMap(map: L.Map) {
    const maxZoom = 14;

    const osmMap = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom,
        attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        opacity: 0.6,
    });

    const osmHOTMap = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        maxZoom,
        attribution:
            '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://wiki.openstreetmap.org/wiki/HOT_style">HOT style</a>',
        opacity: 0.6,
    });

    const openTopoMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom,
        attribution:
            '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://opentopomap.org/">OpenTopoMap</a>',
        opacity: 0.6,
    });

    // OpenAIP layer uses proxy
    const openAipTileLayerUrl = import.meta.env.VITE_OPENAPI_TILE_LAYER_URL;
    const openAipMap = L.tileLayer(openAipTileLayerUrl, {
        maxZoom,
        minZoom: 7,
        attribution: '<a href="https://www.openaip.net">OpenAIP</a>',
    });

    const baseMaps = {
        Standard: osmMap,
        Humanitarian: osmHOTMap,
        Topographic: openTopoMap,
    };

    const overlayMaps = {
        "Aeronautical Data": openAipMap,
    };

    // add to map

    L.control.layers(baseMaps, overlayMaps).setPosition("topleft").addTo(map);
    osmMap.addTo(map); // added first to have the correct ordering in the map attribution
    osmHOTMap.addTo(map);
    openTopoMap.addTo(map);
    openAipMap.addTo(map);

    // initially remove the layers (only osm hot map base layer)
    map.removeLayer(osmMap);
    map.removeLayer(openTopoMap);
}
