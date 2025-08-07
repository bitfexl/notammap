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
export type NotamRenderer = (detailedNotams: DetailedNotam[], onClick: () => void, leafletRenderer: L.Renderer) => L.Layer;

/**
 * Render coordinates for display on the map, or return null if not to render.
 * The onClick function should be called when the marker is clicked.
 */
export type CoordinatesRenderer = (coordinates: CoordinatesList, onClick: () => void, leafletRenderer: L.Renderer) => L.Layer | null;

export const renderCoordinates: CoordinatesRenderer = function (
    cooridnatesList: CoordinatesList,
    onClick: () => void,
    leafletRenderer
): L.Layer {
    const polygon = L.polygon(
        cooridnatesList.coordinates.map((c) => [c.latitude, c.longitude]),
        {
            color: "#ff0000",
            weight: cooridnatesList.coordinates.length == 1 ? 6 : 3,
            renderer: leafletRenderer,
        }
    );

    polygon.on("click", onClick);

    return polygon;
};

export const renderNotams: NotamRenderer = function (detailedNotams: DetailedNotam[], onClick: () => void, leafletRenderer): L.Layer {
    // TODO: properly handle when radius or latitude/longitude are missing, display to user
    const latlng: L.LatLngTuple = [detailedNotams[0].notam.latitude ?? 0, detailedNotams[0].notam.longitude ?? 0];
    const radius = (detailedNotams[0].notam.radius ?? 0) * NM_TO_M; // TODO: use max radius of all notams

    // TODO: render marker using renderer
    const marker = L.marker(latlng, {
        icon: renderIcon("lightgray", "" + detailedNotams.length),
    });
    const circle = L.circle(latlng, { radius, renderer: leafletRenderer });

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
    finalLayer.addLayer(marker); // TODO: add back when rendered with custom renderer

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
    width: 24px;
    height: 24px;
    display: block;
    left: -12px;
    top: -12px;
    position: relative;
    border-radius: 24px 24px 0;
    transform: rotate(45deg);
    border: 1px solid #FFFFFF`;

    return L.divIcon({
        iconAnchor: [0, 20],
        html: `<span style="${style}"><span style="display: block; transform: rotate(-45deg); text-align: center; font-size: 1rem; font-family: monospace;">${text}</span></span>`,
        className: "",
    });

    // return L.icon;
}
