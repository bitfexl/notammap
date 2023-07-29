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

export function defaultMarkerProducer(notams: Notam[], map: L.Map) {
    const notam = notams[0];

    const latlng: L.LatLngTuple = [notam.latitude, notam.longitude];
    const radius = notam.radius * NM_TO_M;

    const marker = L.marker(latlng, {
        icon: createIcon("lightblue", "ABCD"),
    });
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

/**
 * Create a leaflet marker icon.
 * @param color The color (css color).
 * @param text The text at maximum 3 characters. Watch out for xss.
 * @returns A leaflet marker.
 */
export function createIcon(color: string, text: string): L.DivIcon {
    text = text.substring(0, 3); // no xss in 3 chars?

    const style = `
    background-color: ${color};
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    left: -0.75rem;
    top: -0.75rem;
    position: relative;
    border-radius: 1.5rem 1.5rem 0;
    transform: rotate(45deg);
    border: 1px solid #FFFFFF`;

    return L.divIcon({
        iconAnchor: [0, 20],
        html: `<span style="${style}"><span style="display: block; transform: rotate(-45deg); text-align: center; font-size: 1rem; font-family: monospace;">${text}</span></span>`,
    });
}
