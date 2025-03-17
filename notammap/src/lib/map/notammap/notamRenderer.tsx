import { ReactPortal } from "react";
import { NotamListComponent } from "../../notam/NotamListComponent";
import { Notam } from "../../notams/notamextractor";
import { COORDINATES_PATTERN, NM_TO_M, createIcon } from "./notamDisplayHelpers";
import * as L from "leaflet";
import { createPortal } from "react-dom";

export function renderNotam(notams: Notam[], map: L.Map, setPortal: (portal: ReactPortal) => void): L.Layer {
    const latlng: L.LatLngTuple = [notams[0].latitude, notams[0].longitude];
    const radius = notams[0].radius * NM_TO_M; // TODO: use max radius of all notams

    const marker = L.marker(latlng, {
        icon: createIcon("lightgray", "" + notams.length),
    });
    const circle = L.circle(latlng, { radius });

    const onHover = (hover: boolean) => {
        circle.setStyle({ color: hover ? "#00b894" : "#0984e3" });
    };
    onHover(false);
    circle.on("mouseover", () => onHover(true));
    circle.on("mouseout", () => onHover(false));
    marker.on("mouseover", () => onHover(true));
    marker.on("mouseout", () => onHover(false));

    for (const notam of notams) {
        createLocationMarkers(notam);
    }

    const openPoupu = () => {
        const content = document.createElement("div");
        content.style.minWidth = "300px";
        const portal = createPortal(
            <div className="max-h-[80vh] overflow-auto ">
                <NotamListComponent notams={notams}></NotamListComponent>
            </div>,
            content
        );
        L.popup().setLatLng(latlng).setContent(content).openOn(map);
        setPortal(portal);
    };

    marker.on("click", openPoupu);
    circle.on("click", openPoupu);

    const finalLayer = L.layerGroup();
    finalLayer.addLayer(marker);

    // do not show radius for notams with radius > 10km
    if (radius < 10000) {
        finalLayer.addLayer(circle);
    }

    return finalLayer;
}

function createLocationMarkers(notam: Notam) {
    // todo find all unique areas and attached notams to display on the map, refactoring, when loading notams
    for (const match of notam.notamText.match(COORDINATES_PATTERN) ?? []) {
        console.log(notam, match);
    }
}
