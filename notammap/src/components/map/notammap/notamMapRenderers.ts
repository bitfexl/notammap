import { CoordinatesList, DetailedNotam } from "../../../api/notams/notamextractor";
import * as L from "leaflet";
import { canvasMarker } from "../plugins/CanvasMarker";
import { toText } from "../../../api/notams/QCodes";

// TODO: order notams in display on click and in tooltip on hover (qcode)

/**
 * One nautical mile in meters.
 */
export const NM_TO_M = 1852;

/**
 * The default radius in nautical miles for a notam.
 */
export const DEFAULT_RADIUS_NM = 5;

/**
 * Generate a marker for one or more notams.
 * The notams will all have the same or approximately
 * the same coordinates.
 * The onClick function should be called when the marker is clicked.
 * Returns the foreground and background marker or null if one does not exist.
 */
export type NotamRenderer = (
    detailedNotams: DetailedNotam[],
    onClick: () => void,
    leafletRenderer: L.Renderer
) => [L.Layer | null, L.Layer | null];

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

    polygon.on("contextmenu", console.log);

    return polygon;
};

export const renderNotams: NotamRenderer = function (
    detailedNotams: DetailedNotam[],
    onClick: () => void,
    leafletRenderer
): [L.Layer | null, L.Layer | null] {
    // TODO: properly handle when radius or latitude/longitude are missing, display to user
    const latlng: L.LatLngTuple = [detailedNotams[0].notam.latitude ?? 0, detailedNotams[0].notam.longitude ?? 0];

    // filter out the maximum non default (5NM) radius
    // TODO: make setting to show also default radius
    const radiusNM = Math.max(...detailedNotams.map((n) => n.notam.radius ?? 0).filter((r) => r != 0 && r != DEFAULT_RADIUS_NM));
    const radius = radiusNM * NM_TO_M;

    // TODO: show qcodes on hover (title only), like notaminfo

    // TODO: render markers above areas and circles
    const marker: L.Layer = renderIcon("lightgray", "" + detailedNotams.length, latlng, leafletRenderer);

    marker.on("click", onClick);

    marker.bindTooltip(extractQCodeListHtml(detailedNotams), { offset: [15, -15], opacity: 1 });

    // do not show radius for notams with radius > 10km or only default radius
    if (radius > 10000 || radius == -Infinity) {
        return [marker, null];
    }

    const circle = L.circle(latlng, { radius, renderer: leafletRenderer });

    circle.on("click", onClick);

    const onHover = (hover: boolean) => {
        circle.setStyle({ color: hover ? "#00b894" : "#0984e3" });
    };
    onHover(false);
    circle.on("mouseover", () => onHover(true));
    circle.on("mouseout", () => onHover(false));
    marker.on("mouseover", () => onHover(true));
    marker.on("mouseout", () => onHover(false));

    return [marker, circle];
};

/**
 * Create a leaflet marker icon.
 * @param color The color (css color).
 * @param text The text at maximum 3 characters. Watch out for xss.
 * @returns A leaflet marker.
 */
export function renderIcon(color: string, text: string, latlng: L.LatLngTuple, renderer: L.Renderer): L.Layer {
    text = text.substring(0, 3);

    return canvasMarker(latlng, {
        renderer,
        img: {
            size: [30, 30],
            offset: { x: 0, y: -15 },
            url: "data:image/svg+xml;base64," + btoa(renderIconSvg(color, "gray", "black", text)),
        },
    });
}

// TODO: cache this
function renderIconSvg(color: string, borderColor: string, textColor: string, textContent: string) {
    return `<svg width="30px" height="30px" viewBox="-4 -1 36 38" version="1.1" xmlns="http://www.w3.org/2000/svg"><style>#text {
font: 15px sans-serif;
fill: ${textColor};
stroke: none;
user-select: none;
}</style><g stroke="${borderColor}" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-125.000000, -643.000000)"><g transform="translate(37.000000, 169.000000)"><g transform="translate(78.000000, 468.000000)"><g transform="translate(10.000000, 6.000000)"><path d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z" fill="${color}"/><text id="text" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" dy="-2" dx="-4">
${textContent}</text></g></g></g></g></g></svg>`;
}

function extractQCodeListHtml(detailedNotams: DetailedNotam[]) {
    const qCodes = detailedNotams.map((dn) => dn.notam.notamCode?.substring(0, 3) + "XX");
    const order: string[] = [];
    const counts = new Map<string, number>();
    for (const qCode of qCodes) {
        if (counts.has(qCode)) {
            counts.set(qCode, counts.get(qCode)! + 1);
        } else {
            counts.set(qCode, 1);
            order.push(qCode);
        }
    }

    return order
        .map((q) => {
            let text = toText(q);
            const count = counts.get(q);
            if (count != 1) {
                text += " <b>(&times;" + count + ")</b>";
            }
            return text.trim();
        })
        .join("<br>");
}
