package com.github.bitfexl.notamextractor.notamparser;

import java.util.ArrayList;
import java.util.List;

public enum Traffic {
    IFR,
    VFR,

    /**
     * NOTAM is a checklist
     */
    CHECKLIST;

    /**
     * Pares a traffic information.
     * @param traffic The traffic information as provided in item Q.
     * @return A list of affected traffic.
     */
    static List<Traffic> parse(String traffic) {
        List<Traffic> trafficList = new ArrayList<>();

        if (traffic.contains("I") || traffic.contains("i")) {
            trafficList.add(IFR);
        }
        if (traffic.contains("V") || traffic.contains("v")) {
            trafficList.add(VFR);
        }
        if (traffic.contains("K") || traffic.contains("k")) {
            trafficList.add(CHECKLIST);
        }

        return trafficList;
    }
}
