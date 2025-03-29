// See the notamextractor subfolder

export interface NotamData {
    version: "1.0" | string;
    notams: DetailedNotam[];
    coordinatesLists: CoordinatesList[];
}

export interface CoordinatesList {
    hash: string;
    coordinates: Coordinates[];
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface DetailedNotam {
    notam: Notam;
    id: number;
    previousNotamId: number;
    textNodes: TextNode[];
    activePeriods: Period[];
}

export interface Period {}

export interface TextNode {
    text: string;
    reference?: Reference;
}

export interface Reference {
    abbreviation?: string;
    coordinatesList?: string;
    webLink?: string;
    notamId?: number;
}

export interface Notam {
    raw: string;
    series: string;
    number: string;
    year: number;
    type: NotamType;
    previousNotam: Notam;
    fir: string;
    notamCode: string;
    traffic: Traffic[];
    purposes: NotamPurpose[];
    scopes: NotamScope[];
    qLower: number;
    qUpper: number;
    latitude: number;
    longitude: number;
    radius: number;
    locationIndicators: string[];
    from: string;
    to: string;
    isPermanent: boolean;
    isEstimation: boolean;
    schedule: string;
    notamText: string;
    lowerLimit: string;
    upperLimit: string;
    created: string;
    source: string;
}

export type NotamType = "NEW" | "REPLACE" | "CANCEL";

export type Traffic = "IFR" | "VFR" | "CHECKLIST";

export type NotamPurpose = "IMMEDIATE_ATTENTION" | "BULLETIN" | "OPERATIONS" | "MISCELLANEOUS" | "CHECKLIST";

export type NotamScope = "AERODROME" | "ENROUTE" | "NAV_WARNING" | "CHECKLIST";
