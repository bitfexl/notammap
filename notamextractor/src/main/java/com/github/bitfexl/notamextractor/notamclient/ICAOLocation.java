package com.github.bitfexl.notamextractor.notamclient;

/**
 * Represents an icao location identifier.
 * @param country The country or state this location is located in.
 * @param name The readable name of the location.
 * @param icao The icao id of the location.
 */
public record ICAOLocation(String country, String name, String icao) {
}
