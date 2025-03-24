package com.github.bitfexl.notamextractor.notamparser.detailsparser.data;

public record Reference (
        // only one is set
        String abbreviation, // abbreviation code
        String coordinatesList, // cooridantes list hash
        String webLink, // link to a website (inline)
        Long notamId // id of another notam
) {
    public static Reference webLink(String webLink) {
        return new Reference(null, null, webLink, null);
    }

    public static Reference abbreviation(String abbreviation) {
        return new Reference(abbreviation, null, null, null);
    }

    public static Reference coordinatesList(String hash) {
        return new Reference(null, hash, null, null);
    }

    public static Reference notamId(Long notamId) {
        return new Reference(null, null, null, notamId);
    }
}