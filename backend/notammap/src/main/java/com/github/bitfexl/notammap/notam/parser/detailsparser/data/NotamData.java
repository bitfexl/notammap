package com.github.bitfexl.notammap.notam.parser.detailsparser.data;

import java.util.List;

public record NotamData(String version, String date, List<DetailedNotam> notams, List<CoordinatesList> coordinatesLists) {
}
