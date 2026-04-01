package com.github.bitfexl.notammap.notam.extraction;

import java.util.List;

public interface NOTAMClient {
    /**
     * Query aerodrome notams.
     * @param icaoIds The icao ids of the aerodromes to query. The maximum number of ids must be specified by {@link #getMaxADQueryCount()}.
     * @return A list of extracted notams.
     */
    List<String> queryADNotams(List<String> icaoIds);

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
    List<String> queryFIRNotams(List<String> icaoIds);

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
    default List<String> searchAerodromes(String search) {
        throw new UnsupportedOperationException("Searching aerodromes is not supported by " + this.getClass().getName() + ".");
    }

    /**
     * Search for icao FIR ids and names using the specified search string.
     * @param search The search string.
     * @return A list of found FIRs for the specified search string or an empty list.
     */
    default List<String> searchFIRs(String search) {
        throw new UnsupportedOperationException("Searching FIRs is not supported by " + this.getClass().getName() + ".");
    }
}
