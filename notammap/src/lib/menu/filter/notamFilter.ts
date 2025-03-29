import { DetailedNotam, NotamData } from "../../notams/notamextractor";

/**
 * Should return true if a notam should be displayed false if hidden.
 */
export type NotamFilter = (detailedNoatm: DetailedNotam) => boolean;

export interface NotamFilterOptions {
    TRAFFIC: {
        VFR: boolean;
        IFR: boolean;
    };

    PURPOSE: {
        IMMEDIATE_ATTENTION: boolean;
        BULLETIN: boolean;
        OPERATIONS: boolean;
        MISCELLANEOUS: boolean;
    };

    QCODES: {
        OBSTACLES: boolean;
        AIRSPACE_RESTRICTIONS: boolean;
        WARNINGS: boolean;
        ATM: boolean;
        CNS: boolean;
        AGA: boolean;
        COM: boolean;
    };

    FROM: string;

    TO: string;
}

export const defaultFilterOptions: NotamFilterOptions = {
    TRAFFIC: {
        VFR: true,
        IFR: true,
    },
    PURPOSE: {
        IMMEDIATE_ATTENTION: true,
        BULLETIN: true,
        OPERATIONS: true,
        MISCELLANEOUS: true,
    },
    QCODES: {
        OBSTACLES: true,
        AIRSPACE_RESTRICTIONS: true,
        WARNINGS: true,
        ATM: true,
        CNS: true,
        AGA: true,
        COM: true,
    },
    FROM: "",
    TO: "",
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

        // Trafic
        if (!anyMatch(options.TRAFFIC, notam.traffic)) {
            return false;
        }

        // Purpose
        if (!anyMatch(options.PURPOSE, notam.purposes)) {
            return false;
        }

        // Q-codes
        if (!options.QCODES.OBSTACLES && startsWithAny(notam.notamCode, ["QOB", "QOL"])) {
            return false;
        }
        if (!options.QCODES.AIRSPACE_RESTRICTIONS && startsWithAny(notam.notamCode, ["QR"])) {
            return false;
        }
        if (!options.QCODES.WARNINGS && startsWithAny(notam.notamCode, ["QW"])) {
            return false;
        }
        if (!options.QCODES.ATM && startsWithAny(notam.notamCode, ["QA", "QP", "QS"])) {
            return false;
        }
        if (!options.QCODES.CNS && startsWithAny(notam.notamCode, ["QC", "QG", "QI"])) {
            return false;
        }
        if (!options.QCODES.AGA && startsWithAny(notam.notamCode, ["QF", "QL", "QM"])) {
            return false;
        }
        if (!options.QCODES.COM && startsWithAny(notam.notamCode, ["QN"])) {
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
        if (value && values.includes(key as any)) {
            return true;
        }
    }

    return false;
}
