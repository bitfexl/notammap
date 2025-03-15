package com.github.bitfexl.notamextractor.notamparser;

import java.util.ArrayList;
import java.util.List;

public enum NotamScope {
    AERODROME,
    ENROUTE,
    NAV_WARNING,
    CHECKLIST;

    /**
     * Pares a notam scope information.
     * @param scope The scope as provided in item Q.
     * @return A list of scope(s).
     */
    static List<NotamScope> parse(String scope) {
        List<NotamScope> scopes = new ArrayList<>();

        if (scope.contains("A") || scope.contains("a")) {
            scopes.add(AERODROME);
        }
        if (scope.contains("E") || scope.contains("e")) {
            scopes.add(ENROUTE);
        }
        if (scope.contains("W") || scope.contains("w")) {
            scopes.add(NAV_WARNING);
        }
        if (scope.contains("K") || scope.contains("k")) {
            scopes.add(CHECKLIST);
        }

        return scopes;
    }
}
