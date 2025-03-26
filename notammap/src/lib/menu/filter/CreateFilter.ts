import { NotamFilter } from "../../map/notammap/notamDisplayHelpers";
import { DetailedNotam } from "../../notams/notamextractor";
import { NotamFilterOptions } from "./NotamFilterOptions";

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
