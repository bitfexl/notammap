import { ReactPortal } from "react";
import { NotamListComponent } from "../../../notam/NotamListComponent";
import { Notam } from "../../../notams/notamextractor";
import { NM_TO_M, createIcon } from "../NotamDisplayHelpers";
import * as L from "leaflet";
import { createPortal } from "react-dom";

export function markerProducer(notams: Notam[], map: L.Map): [L.Layer, ReactPortal | null] {
    const notam = notams[0];

    const latlng: L.LatLngTuple = [notam.latitude, notam.longitude];
    const radius = notam.radius * NM_TO_M;

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

    const content = document.createElement("div");
    const portal = createPortal(
        <div className="max-h-[80vh] overflow-auto ">
            <NotamListComponent notams={notams}></NotamListComponent>
        </div>,
        content
    );
    const openPoupu = () => {
        L.popup().setLatLng(latlng).setContent(content).openOn(map);
    };

    marker.on("click", openPoupu);
    circle.on("click", openPoupu);

    const finalLayer = L.layerGroup();
    finalLayer.addLayer(marker);

    // do not show radius for notams with radius > 10km
    if (radius < 10000) {
        finalLayer.addLayer(circle);
    }

    finalLayer.addTo(map);
    return [finalLayer, portal];
}
