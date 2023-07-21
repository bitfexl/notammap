/* tslint:disable */
/* eslint-disable */
// See: https://github.com/bitfexl/notamextractor

export interface Notam {
    raw: string;
    series: string;
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
