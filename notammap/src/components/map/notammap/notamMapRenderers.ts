import { CoordinatesList, DetailedNotam } from "../../../api/notams/notamextractor";
import * as L from "leaflet";

/**
 * One nautical mile in meters.
 */
export const NM_TO_M = 1852;

/**
 * Generate a marker for one or more notams.
 * The notams will all have the same or approximately
 * the same coordinates.
 * The onClick function should be called when the marker is clicked.
 */
export type NotamRenderer = (detailedNotams: DetailedNotam[], onClick: () => void) => L.Layer;

/**
 * Render coordinates for display on the map, or return null if not to render.
 * The onClick function should be called when the marker is clicked.
 */
export type CoordinatesRenderer = (coordinates: CoordinatesList, onClick: () => void) => L.Layer | null;

export const renderCoordinates: CoordinatesRenderer = function (cooridnatesList: CoordinatesList, onClick: () => void): L.Layer {
    const polygon = L.polygon(
        cooridnatesList.coordinates.map((c) => [c.latitude, c.longitude]),
        {
            color: "#ff0000",
            weight: cooridnatesList.coordinates.length == 1 ? 6 : 3,
        }
    );

    polygon.on("click", onClick);

    return polygon;
};

export const renderNotams: NotamRenderer = function (detailedNotams: DetailedNotam[], onClick: () => void): L.Layer {
    const latlng: L.LatLngTuple = [detailedNotams[0].notam.latitude, detailedNotams[0].notam.longitude];
    const radius = detailedNotams[0].notam.radius * NM_TO_M; // TODO: use max radius of all notams

    const marker = L.marker(latlng, {
        icon: renderIcon("lightgray", "" + detailedNotams.length),
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

    marker.on("click", onClick);
    circle.on("click", onClick);

    const finalLayer = L.layerGroup();
    finalLayer.addLayer(marker);

    // do not show radius for notams with radius > 10km
    if (radius < 10000) {
        finalLayer.addLayer(circle);
    }

    return finalLayer;
};

/**
 * Create a leaflet marker icon.
 * @param color The color (css color).
 * @param text The text at maximum 3 characters. Watch out for xss.
 * @returns A leaflet marker.
 */
export function renderIcon(color: string, text: string): L.DivIcon {
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
