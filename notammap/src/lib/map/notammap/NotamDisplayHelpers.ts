import { Notam } from "../../notams/notamextractor";
import * as L from "leaflet";

/**
 * One nautical mile in meters.
 */
export const NM_TO_M = 1852;

/**
 * Should return true if a notam should be displayed false if hidden.
 */
export type NotamFilter = (notam: Notam) => boolean;

/**
 * Generate a marker for one or more notams and add to the map.
 * The notams will all have the same or approximately
 * the same coordinates. The marker is responsible for showing
 * the notam on click.
 */
export type NotamMarkerProducer = (notams: Notam[], map: L.Map) => L.Layer;

export function defaultFilter(notam: Notam) {
    return true;
}

export function defaultMarkerProducer(notams: Notam[], map: L.Map) {
    const notam = notams[0];

    const latlng: L.LatLngTuple = [notam.latitude, notam.longitude];
    const radius = notam.radius * NM_TO_M;

    const marker = L.marker(latlng);
    const circle = L.circle(latlng, { radius });

    const openPoupu = () => {
        const content = document.createElement("p");
        content.innerText = notam.notamText;
        L.popup().setLatLng(latlng).setContent(content).openOn(map);
    };

    marker.on("click", openPoupu);
    circle.on("click", openPoupu);

    const finalLayer = L.layerGroup();
    finalLayer.addLayer(marker);

    // do not show radius for notams with radius > 10km
    // TODO: more filter options
    if (radius < 10000) {
        finalLayer.addLayer(circle);
    }

    finalLayer.addTo(map);
    return finalLayer;
}
