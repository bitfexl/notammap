import { ReactPortal } from "react";
import { NotamListComponent } from "../../notam/NotamListComponent";
import { CoordinatesList, DetailedNotam } from "../../notams/notamextractor";
import { NM_TO_M, createIcon } from "./notamDisplayHelpers";
import * as L from "leaflet";
import { createPortal } from "react-dom";

export function renderCoordinates(cooridnatesList: CoordinatesList): L.Layer {
    // TODO: onclick show notams
    return L.polygon(
        cooridnatesList.coordinates.map((c) => [c.latitude, c.longitude]),
        {
            color: "#ff0000",
            weight: cooridnatesList.coordinates.length == 1 ? 6 : 3,
        }
    );
}

export function renderNotams(detailedNotams: DetailedNotam[], map: L.Map, setPortal: (portal: ReactPortal) => void): L.Layer {
    const latlng: L.LatLngTuple = [detailedNotams[0].notam.latitude, detailedNotams[0].notam.longitude];
    const radius = detailedNotams[0].notam.radius * NM_TO_M; // TODO: use max radius of all notams

    const marker = L.marker(latlng, {
        icon: createIcon("lightgray", "" + detailedNotams.length),
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

    const openPoupu = () => {
        const content = document.createElement("div");
        content.style.minWidth = "300px";
        const portal = createPortal(
            <div className="max-h-[80vh] overflow-auto ">
                <NotamListComponent detailedNotams={detailedNotams}></NotamListComponent>
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
