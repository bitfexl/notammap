package com.github.bitfexl.notamextractor.notamparser.detailsparser.data;

import com.github.bitfexl.notamextractor.notamparser.Notam;

import java.util.List;

public record NotamData(String version, List<DetailedNotam> notams, List<CoordinatesList> coordinatesLists) {
}
