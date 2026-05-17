package com.github.bitfexl.notammap.repository.entities;

import com.github.bitfexl.notammap.notam.parser.NotamPurpose;
import com.github.bitfexl.notammap.notam.parser.NotamScope;
import com.github.bitfexl.notammap.notam.parser.NotamType;
import com.github.bitfexl.notammap.notam.parser.Traffic;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Entity
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notam extends BaseEntity {
    //region fields added by application/raw fields

    /**
     * Primary key.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;

    /**
     * The raw notam (as it was extracted) including every item.
     */
    @Column(columnDefinition = "text")
    String raw;

    /**
     * The source of the notam (extraction source).
     */
    String source;

    //endregion

    //region series/header fields

    /**
     * The notam series, the letter in front of the notam number.
     * Each series is unique to the fir and must have a unique numbering.
     * A letter (A-Z without S and T) e.g. 'A' for A0001.
     * A series should start at 0001 each year in each region/country.
     * If the letter is S the notam should be in the snowtam format, according to the
     * format specification.
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

    // TODO: unique id, which requires the series, number, year and authority (or possibly fir) for the notam, the custom source might also be taken into account

    // TODO: how to store this? string or enum?
    /**
     * The notam type.
     */
    // TOOD: enum column type string
    NotamType type;

    /**
     * The series of the previous notam if type is NOTAMC see {@link #series}
     */
    Character previousNotamSeries;

    /**
     * The number of the previous notam if type is NOTAMC see {@link #number}
     */
    Character previousNotamNumber;

    /**
     * The year of the previous notam if type is NOTAMC see {@link #year}
     */
    Integer previousNotamYear;

    //endregion

    //region q line fields

    /**
     * The flight information region as provided in item Q.
     * Is set to the nationality letters + "XX" in the case of multiple
     * FIRs. The FIRs are then listen in item A.
     */
    String fir;

    /**
     * The 4 letters of the 5 letter notam code as provided in item Q after the Q.
     * See: https://www.faa.gov/air_traffic/publications/atpubs/notam_html/appendix_b.html
     */
    String notamCode;

    /**
     * The affected traffic as provided in item Q contains I for IFR.
     */
    boolean trafficIsIfr;

    /**
     * The affected traffic as provided in item Q contains V for VFR.
     */
    boolean trafficIsVrf;

    /**
     * The affected traffic as provided in item Q contains K for a checklist.
     * This should only be true if the other two traffics are false.
     */
    boolean trafficIsChecklist;

    /**
     * If the notam purpose contains N.
     * Valid combinations should only be NBO, BO which appear in PIB,
     * M or K.
     */
    boolean purposeIsImmediateAttention;

    /**
     * If the notam purpose contains B.
     * Valid combinations should only be NBO, BO which appear in PIB,
     * M or K.
     */
    boolean purposeIsOperationallySignificant;

    /**
     * If the notam purpose contains O.
     * Valid combinations should only be NBO, BO which appear in PIB,
     * M or K.
     */
    boolean purposeIsFlightOperations;

    /**
     * If the notam purpose contains/is M.
     * Valid combinations should only be NBO, BO which appear in PIB,
     * M or K.
     */
    boolean purposeIsMiscellaneous;

    /**
     * If the notam purpose contains/is K.
     * Valid combinations should only be NBO, BO which appear in PIB,
     * M or K.
     */
    boolean purposeIsChecklist;

    /**
     * The notam affects aerodromes.
     */
    boolean scopeIsAerordrome;

    /**
     * The notam affects enroute information.
     */
    boolean scopeIsEnroute;

    /**
     * The notam effects a nav warning.
     */
    boolean scopeIsNavWarning;

    /**
     * The notam is a checklist, other scope types should be false.
     */
    boolean scopeIsChecklist;

    /**
     * The lower limit in FL or in hundreds of feet below the transition level as provided in item Q.
     * Item F and G should be the same.
     * If no specific height information is provided
     * 0 and 999 are assumed for lower and upper limit.
     */
    Integer QLowerLimit;

    /**
     * The lower limit in FL or in hundreds of feet below the transition level as provided in item Q.
     * Item F and G should be the same.
     * If no specific height information is provided
     * 0 and 999 are assumed for lower and upper limit.
     */
    Integer QUpperLimit;

    // TODO: q line coordinates and radius (as postgis object)

    //endregion

    // other items (A-G)

    /**
     * Item A
     * ICAO location indicators as provided in item A.
     * Is set to the nationality letters + "XX" in the case of a not
     * ICAO location. Then details are provided in item E.
     */
    // TODO: this needs to be a list
    String locationIndicators;

    /**
     * Item B
     * Notam validity start.
     */
    Instant startOfValidity;

    /**
     * Item C
     * Notam validity end, might be null if PERM. Or end in EST.
     */
    Instant endOfValidity;

    /**
     * If item C is an estimation (EST).
     */
    boolean endOfValidityIsEstimate;

    /**
     * true if item C is PERM (permanent notam).
     */
    boolean validityIsPermanent;

    // TODO: item D time schedule

    /**
     * Item E
     * The raw text provided.
     */
    String notamText;

    /**
     * Item E
     * The lower limit as provided.
     */
    String lowerLimit;

    /**
     * Item G
     * The upper limit as provided.
     */
    String upperLimit;
}
