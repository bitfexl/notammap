package com.github.bitfexl.notamextractor.notamparser;

import java.util.ArrayList;
import java.util.List;

public enum NotamPurpose {
    /**
     * NOTAM selected for the immediate attention of flight crew members
     */
    IMMEDIATE_ATTENTION,

    /**
     * NOTAM of operational significance selected for PIB entry
     */
    BULLETIN,

    /**
     * NOTAM concerning flight operations
     */
    OPERATIONS,

    /**
     * Miscellaneous NOTAM; not subject for a briefing, but it is available on request
     */
    MISCELLANEOUS,

    /**
     * NOTAM is a checklist
     */
    CHECKLIST;

    /**
     * Pares a notam purpose information.
     * @param purpose The purpose as provided in item Q.
     * @return A list of purpose(s).
     */
    static List<NotamPurpose> parse(String purpose) {
        List<NotamPurpose> purposeList = new ArrayList<>();

        if (purpose.contains("N") || purpose.contains("n")) {
            purposeList.add(IMMEDIATE_ATTENTION);
        }
        if (purpose.contains("B") || purpose.contains("b")) {
            purposeList.add(BULLETIN);
        }
        if (purpose.contains("O") || purpose.contains("o")) {
            purposeList.add(OPERATIONS);
        }
        if (purpose.contains("M") || purpose.contains("m")) {
            purposeList.add(MISCELLANEOUS);
        }
        if (purpose.contains("K") || purpose.contains("k")) {
            purposeList.add(CHECKLIST);
        }

        return purposeList;
    }
}
