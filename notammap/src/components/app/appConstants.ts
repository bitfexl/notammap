import { LatLngTuple } from "leaflet";

export const MAIN_MAP_ID = "main_map";

export namespace LocalStorage {
    export namespace Keys {
        const baseKey = "notammap.config.";

        export const MAP_CORDS_AND_ZOOM = baseKey + "map.cordsZoom";
        export const DATA_COUNTRY = baseKey + "data.country";
        export const DATA_FILTER = baseKey + "data.filter";
        export const MENU_SELECTED = baseKey + "menu.selected";
    }

    export namespace Types {
        export interface MapCordsAndZoom {
            cords: LatLngTuple;
            zoom: number;
        }
    }
}
