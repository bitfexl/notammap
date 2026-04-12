package com.github.bitfexl.notammap.notam.extraction;

import com.github.bitfexl.notammap.notam.extraction.natsead.AerodromeSearchResult;
import com.github.bitfexl.notammap.notam.extraction.natsead.FIRSearchResult;

import java.util.List;
import java.util.concurrent.Future;

public interface NOTAMClient {
    /**
     * Query aerodrome notams.
     * @param icaoIds The icao ids of the aerodromes to query. The maximum number of ids must be specified by {@link #getMaxADQueryCount()}.
     * @return A list of extracted notams.
     */
    List<ExtractedNotamData> queryADNotams(List<String> icaoIds);

    /**
     * The maximum number of notams supported by {@link #queryADNotams(List)}.
     * @return The maximum, > 0.
     */
    int getMaxADQueryCount();

    /**
     * Query FIR notams.
     * @param icaoIds The icao ids of the FIRs to query. The maximum number of ids must be specified by {@link #getMaxFIRQueryCount()}.
     * @return A list of extracted notams.
     */
    List<ExtractedNotamData> queryFIRNotams(List<String> icaoIds);

    /**
     * The maximum number of notams supported by {@link #queryFIRNotams(List)}.
     * @return The maximum, > 0.
     */
    int getMaxFIRQueryCount();

    /**
     * Search for icao aerodrome ids and names using the specified search string.
     * @param search The search string.
     * @return A list of found aerodromes for the specified search string or an empty list.
     */
    default Future<List<AerodromeSearchResult>> searchAerodromes(String search) {
        throw new UnsupportedOperationException("Searching aerodromes is not supported by " + this.getClass().getName() + ".");
    }

    /**
     * Search for icao FIR ids and names using the specified search string.
     * @param search The search string.
     * @return A list of found FIRs for the specified search string or an empty list.
     */
    default Future<List<FIRSearchResult>> searchFIRs(String search) {
        throw new UnsupportedOperationException("Searching FIRs is not supported by " + this.getClass().getName() + ".");
    }
}
