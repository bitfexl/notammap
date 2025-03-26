import { ReactPortal } from "react";
import { CoordinatesList, DetailedNotam } from "../../notams/notamextractor";
import * as L from "leaflet";

/**
 * One nautical mile in meters.
 */
export const NM_TO_M = 1852;

/**
 * Should return true if a notam should be displayed false if hidden.
 */
export type NotamFilter = (detailedNoatm: DetailedNotam) => boolean;

/**
 * Generate a marker for one or more notams. Do not add the final layer to the map.
 * The notams will all have the same or approximately
 * the same coordinates. The marker (tile layer) is responsible for showing
 * the notam on click. Use setPortal to render a react node on click.
 */
export type NotamRenderer = (detailedNotams: DetailedNotam[], map: L.Map, setPortal: (portal: ReactPortal) => void) => L.Layer;

/**
 * Render coordinates for display on the map, or return null if not to render.
 */
export type CoordinatesRenderer = (coordinates: CoordinatesList) => L.Layer | null;

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
