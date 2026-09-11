package com.github.bitfexl.notammap.service;

import com.github.bitfexl.notammap.notam.extraction.natsead.AerodromeSearchResult;
import com.github.bitfexl.notammap.notam.extraction.natsead.FIRSearchResult;
import com.github.bitfexl.notammap.notam.extraction.natsead.NATSExtractor;
import com.github.bitfexl.notammap.repository.ICAOIdentifierRepository;
import com.github.bitfexl.notammap.repository.ICAOIdentifierSearchRepository;
import com.github.bitfexl.notammap.repository.entities.ICAOIdentifier;
import com.github.bitfexl.notammap.repository.entities.ICAOIdentifierSearch;
import com.github.bitfexl.notammap.repository.entities.types.IdentifierType;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class IcaoCodeLookupService {
    @Inject
    NATSExtractor natsExtractor;

    @Inject
    ICAOIdentifierRepository icaoIdentifierRepository;

    @Inject
    ICAOIdentifierSearchRepository icaoIdentifierSearchRepository;

    public record SearchResult(String searchString, Instant startTimestamp, Instant insertStartTimestamp, Instant endTimestamp, boolean fullyCompleted, int totalRecords, int newRecords) { }

    /**
     * Searches for icao aerodrome ids and returns the number of new ids inserted.
     * @param search The search string.
     * @return The result of the search
     */
    public Uni<SearchResult> searchAerodromes(String search) {
        final Instant startTimestamp = Instant.now();
        return natsExtractor.searchAerodromes(search).onItem().transform(
                (result) -> {
                    if (!result.completed()) {
                        Log.error("Aerodrome search for '" + search + "' only completed partially.", result.cause());
                    }
                    final Instant insertStartTimestamp = Instant.now();
                    final int newRecords = insertAdSearchResults(search, result.results(), "NATS");
                    final Instant endTimestamp = Instant.now();
                    return new SearchResult(search, startTimestamp, insertStartTimestamp, endTimestamp, result.completed(), result.results().size(), newRecords);
                }
        );
    }

    /**
     * Searches for icao aerodrome ids and returns the number of new ids inserted.
     * @param search The search string.
     * @return The result of the search
     */
    public Uni<SearchResult> searchFirs(String search) {
        final Instant startTimestamp = Instant.now();
        return natsExtractor.searchFIRs(search).onItem().transform(
                (result) -> {
                    if (!result.completed()) {
                        Log.error("Fir search for '" + search + "' only completed partially.", result.cause());
                    }
                    final Instant insertStartTimestamp = Instant.now();
                    final int newRecords = insertFirSearchResults(search, result.results(), "NATS");
                    final Instant endTimestamp = Instant.now();
                    return new SearchResult(search, startTimestamp, insertStartTimestamp, endTimestamp, result.completed(), result.results().size(), newRecords);
                }
        );
    }

    /**
     * Looks up icao identifiers in the db and returns all not in the db.
     * @param identifiers The identifiers to check.
     * @return Only those not found in the db, does not mean that the identifiers are invalid.
     */
    public List<String> getNonExistentIdentifiers(List<String> identifiers) {
        return icaoIdentifierRepository.getNonExistentIdentifiers(identifiers);
    }

    public List<String> getFIRIdentifiers(List<String> identifiers) {
        return icaoIdentifierRepository.getFIRIdentifiers(identifiers);
    }

    @Transactional
    int insertAdSearchResults(String searchString, List<AerodromeSearchResult> searchResults, String source) {
        final ICAOIdentifierSearch icaoIdentifierSearch = new ICAOIdentifierSearch();
        icaoIdentifierSearch.setSearchString(searchString);
        icaoIdentifierSearch.setSearchType(IdentifierType.AERODROME);
        icaoIdentifierSearch.setSource(source);
        icaoIdentifierSearch.setFoundIdentifiers(searchResults.size());

        icaoIdentifierSearchRepository.persist(icaoIdentifierSearch);

        int newIdentifiers = 0;

        for (AerodromeSearchResult result : searchResults) {
            ICAOIdentifier identifier = icaoIdentifierRepository.findById(result.icao());

            if (identifier == null) {
                identifier = new ICAOIdentifier();
                identifier.setId(result.icao());
                identifier.setFirstSearch(icaoIdentifierSearch);
                newIdentifiers++;
            }

            identifier.setType(IdentifierType.AERODROME);
            identifier.setAerodromeType(result.type());
            identifier.setIataCode(result.iata());
            identifier.setFir(result.fir());
            identifier.setName(result.name());
            identifier.setLastSearch(icaoIdentifierSearch);

            icaoIdentifierRepository.persist(identifier);
        }

        icaoIdentifierSearch.setNewIdentifiers(newIdentifiers);

        icaoIdentifierSearchRepository.persist(icaoIdentifierSearch);

        return newIdentifiers;
    }

    @Transactional
    int insertFirSearchResults(String searchString, List<FIRSearchResult> searchResults, String source) {
        final ICAOIdentifierSearch icaoIdentifierSearch = new ICAOIdentifierSearch();
        icaoIdentifierSearch.setSearchString(searchString);
        icaoIdentifierSearch.setSearchType(IdentifierType.FIR);
        icaoIdentifierSearch.setSource(source);
        icaoIdentifierSearch.setFoundIdentifiers(searchResults.size());

        icaoIdentifierSearchRepository.persist(icaoIdentifierSearch);

        int newIdentifiers = 0;

        for (FIRSearchResult result : searchResults) {
            ICAOIdentifier identifier = icaoIdentifierRepository.findById(result.icao());

            if (identifier == null) {
                identifier = new ICAOIdentifier();
                identifier.setId(result.icao());
                identifier.setFirstSearch(icaoIdentifierSearch);
                newIdentifiers++;
            }

            identifier.setType(IdentifierType.FIR);
            identifier.setName(result.name());
            identifier.setFir(identifier.getId());
            identifier.setLastSearch(icaoIdentifierSearch);

            icaoIdentifierRepository.persist(identifier);
        }

        icaoIdentifierSearch.setNewIdentifiers(newIdentifiers);

        icaoIdentifierSearchRepository.persist(icaoIdentifierSearch);

        return newIdentifiers;
    }
}
