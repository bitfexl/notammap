package com.github.bitfexl.notamextractor.notamparser;

/**
 * The notam type.
 * NEW for "NOTAMN",
 * REPLACE for "NOTAMR",
 * CANCEL for "NOTAMC";
 */
public enum NotamType {
    NEW,
    REPLACE,
    CANCEL;

    /**
     * Parse a notam type.
     * @param s The notam type, one of "NOTAMN", "NOTAMR", "NOTAMC".
     * @returns The parsed type.
     */
    static NotamType parse(String s) {
        return switch (s) {
            case "NOTAMN" -> NEW;
            case "NOTAMR" -> REPLACE;
            case "NOTAMC" -> CANCEL;
            default -> throw new IllegalArgumentException("Unknown type '" + s + "'.");
        };
    }
}
