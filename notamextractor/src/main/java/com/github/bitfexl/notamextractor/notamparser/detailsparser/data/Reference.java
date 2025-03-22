package com.github.bitfexl.notamextractor.notamparser.detailsparser.data;

public record Reference (
        // only one is set
        String abbreviation, // abbreviation code
        String coordinatesList, // cooridantes list hash
        String webLink, // link to a website (inline)
        String notamId // id of another notam idVersion (1/2 byte) notam type (new, replaces, cancels 1/2 byte) year starting from 1000 (to max 3047) (1+1/2 bytes) notam series (2 bytes) fir (A-Z * 4, 3 bytes)
) {}