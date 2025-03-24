package com.github.bitfexl.notamextractor.notamparser;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.Objects;

@Value
@Builder
public class Notam {
    /**
     * The raw notam text.
     */
    String raw;

    /**
     * The notam series, the letter in front of the notam number.
     * Each series is unique to the fir and must have a unique numbering.
     * A letter (A-Z without S and T) e.g. 'A' for A0001.
     */
    Character series;

    /**
     * The notam number right after the series, which is unique to that series.
     * Always 4 digits, for correct display prefix with 0 if less.
     */
    Integer number;

    /**
     * The notam year (after first /). The full year and not just
     * the last two digits (like after the / after the series).
     */
    Integer year;

    /**
     * The notam type.
     */
    NotamType type;

    /**
     * Only available (not null) if type
     * is REPLACE or CANCEL.
     * Only the series, number and year fields are
     * guarantied to be set.
     */
    Notam previousNotam;

    /**
     * The flight information region as provided in item Q.
     * Is set to the nationality letters + "XX" in the case of multiple
     * FIRs. The FIRs are then listen in item A.
     */
    String fir;

    /**
     * The 5 letter notam code as provided in item Q.
     * See: https://www.faa.gov/air_traffic/publications/atpubs/notam_html/appendix_b.html
     */
    String notamCode;

    /**
     * The affected traffic as provided in item Q.
     */
    List<Traffic> traffic;

    /**
     * The notam purpose as provided in item Q.
     */
    List<NotamPurpose> purposes;

    /**
     * The notam scopes as provided in item Q.
     */
    List<NotamScope> scopes;

    /**
     * The lower limit in FL or in thousands of feet below the transition level as provided in item Q.
     * Item F and G should be the same.
     * If no specific height information is provided
     * 0 and 999 are assumed for lower and upper limit.
     */
    Integer qLower;

    /**
     * The lower limit in FL or in thousands of feet below the transition level as provided in item Q.
     * Item F and G should be the same.
     * If no specific height information is provided
     * 0 and 999 are assumed for lower and upper limit.
     */
    Integer qUpper;

    /**
     * The latitude of the coordinates and radius provided in item Q. (ISO 6709 format)
     */
    Double latitude;

    /**
     *  The longitude of the coordinates and radius provided in item Q. (ISO 6709 format)
     */
    Double longitude;

    /**
     * The radius of the coordinates and radius provided in item Q in nautical miles.
     */
    Integer radius;

    /**
     * ICAO location indicators as provided in item A.
     * Is set to the nationality letters + "XX" in the case of a not
     * ICAO location. Then details are provided in item E.
     */
    List<String> locationIndicators;

    /**
     * The date and time as provided in item B (UTC).
     * In the ISO 8601 (https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    // TODO: REAL DATES
    String from;

    /**
     * The date and time as provided in item C (UTC).
     * In the ISO 8601 (https://en.wikipedia.org/wiki/ISO_8601) format.
     * Might be null, in which case isPermanent should be true.
     * Might be an estimation in which case isEstimation should be true.
     */
    String to;

    /**
     * If item C (to) is "PERM".
     * If true, item C should be null.
     */
    Boolean isPermanent;

    /**
     * If true item C (to) is just an estimation.
     */
    Boolean isEstimation;

    /**
     * The schedule as provided in item D.
     * Might be null.
     */
    String schedule;

    /**
     * The plain text provided in item E.
     */
    String notamText;

    /**
     * The lower limit as provided in item F.
     * Should be the same as aLower if provided.
     * Unit of measurement is clearly indicated.
     * The abbreviations "GND" (ground) and "SFC" (surface) may be used.
     */
    String lowerLimit;

    /**
     * The upper limit as provided in item G.
     * Should be the same as aUpper if provided.
     * Unit of measurement is clearly indicated.
     * The abbreviation "UNL" (unlimited) may be used.
     */
    String upperLimit;

    /**
     * The created line at the end of each notam returned by DINS.
     */
    String created;

    /**
     * The source line at the end of each notam returned by DINS.
     */
    String source;

    /**
     * Checks if qLower and qUpper are set (provided specific information).
     * @return true: qLower and qUpper have set values, false: qLower=0, qUpper=999;
     */
    public boolean hasSpecificHeightInformation() {
        return qLower != 0 && qUpper != 999;
    }

    @Override
    public String toString() {
        return raw;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Notam notam = (Notam) o;
        return Objects.equals(raw, notam.raw);
    }

    @Override
    public int hashCode() {
        return raw != null ? raw.hashCode() : 0;
    }
}
