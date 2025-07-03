import { DetailedNotam, NotamData } from "../../../api/notams/notamextractor";
import { firstTablesTable } from "../../../assets/QCodeTables.json";

/**
 * Should return true if a notam should be displayed false if hidden.
 */
export type NotamFilter = (detailedNoatm: DetailedNotam) => boolean;

export interface NotamFilterOptions {
    TRAFFIC: {
        VFR: boolean;
        IFR: boolean;
        CHECKLIST: true; // checklist filtered by SCOPE
    };

    PURPOSE: {
        IMMEDIATE_ATTENTION: boolean;
        BULLETIN: boolean;
        OPERATIONS: boolean;
        MISCELLANEOUS: boolean;
        CHECKLIST: true; // checklist filtered by SCOPE
    };

    QCODES: string[];

    SCOPE: {
        AERODROME: boolean;
        ENROUTE: boolean;
        NAV_WARNING: boolean;
        CHECKLIST: boolean;
    };

    DATE: {
        DAYS: number;
        FROM: string;
        TO: string;
    };
}

export const defaultFilterOptions: NotamFilterOptions = {
    TRAFFIC: {
        VFR: true,
        IFR: true,
        CHECKLIST: true,
    },
    PURPOSE: {
        IMMEDIATE_ATTENTION: true,
        BULLETIN: true,
        OPERATIONS: true,
        MISCELLANEOUS: true,
        CHECKLIST: true,
    },
    QCODES: Object.keys(firstTablesTable),
    SCOPE: {
        AERODROME: true,
        ENROUTE: true,
        NAV_WARNING: true,
        CHECKLIST: true,
    },
    DATE: {
        DAYS: 7,
        FROM: "",
        TO: "",
    },
};

export function filterNotamData(notamData: NotamData, filterOrOptions: NotamFilterOptions | NotamFilter): NotamData {
    if (typeof filterOrOptions == "object") {
        filterOrOptions = createFilter(filterOrOptions);
    }
    return filterWithFilter(notamData, filterOrOptions);
}

function filterWithFilter(notamData: NotamData, notamFilter: NotamFilter): NotamData {
    const notams = notamData.notams.filter(notamFilter);

    const containedHashes = notams
        .flatMap((n) => n.textNodes)
        .filter((t) => t.reference?.coordinatesList != null)
        .map((cr) => cr.reference?.coordinatesList);

    return {
        version: notamData.version,
        notams,
        coordinatesLists: notamData.coordinatesLists.filter((cl) => containedHashes.includes(cl.hash)),
    };
}

export function createFilter(options: NotamFilterOptions): NotamFilter {
    return function (detailedNoatm: DetailedNotam) {
        const notam = detailedNoatm.notam;

        // Traffic
        if (!anyMatch(options.TRAFFIC, notam.traffic)) {
            console.log("No match: Traffic", notam);
            return false;
        }

        // Purpose
        if (!anyMatch(options.PURPOSE, notam.purposes)) {
            console.log("No match: Purpose", notam);
            return false;
        }

        // Scope
        if (!anyMatch(options.SCOPE, notam.scopes)) {
            console.log("No match: Scope", notam);
            return false;
        }

        // Q-Code
        // K... checklist filtered by scope, TODO: better for X use only first letter
        if (!["K", "X"].includes(notam.notamCode[2]) && !startsWithAny(notam.notamCode.substring(1, 3), options.QCODES)) {
            console.log("No match: QCode", notam);
            return false;
        }

        return true;
    };
}

function startsWithAny(s: string, values: string[]) {
    for (let value of values) {
        if (s.startsWith(value)) {
            return true;
        }
    }

    return false;
}

function anyMatch(filter: { [key: string]: boolean }, values: string[]) {
    for (const [key, value] of Object.entries(filter)) {
        if (value && values.includes(key)) {
            return true;
        }
    }

    return false;
}
