package com.github.bitfexl.notammap.service;

import com.github.bitfexl.notammap.event.SearchCompletedEvent;
import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamData;
import com.github.bitfexl.notammap.notam.extraction.NOTAMClient;
import com.github.bitfexl.notammap.notam.extraction.faa.FAANotamExtractor;
import com.github.bitfexl.notammap.notam.extraction.natsead.AerodromeSearchResult;
import com.github.bitfexl.notammap.notam.extraction.natsead.FIRSearchResult;
import com.github.bitfexl.notammap.notam.extraction.natsead.NATSExtractor;
import com.github.bitfexl.notammap.repository.ICAOIdentifierRepository;
import com.github.bitfexl.notammap.repository.ICAOIdentifierSearchRepository;
import com.github.bitfexl.notammap.repository.entities.ICAOIdentifier;
import com.github.bitfexl.notammap.repository.entities.ICAOIdentifierSearch;
import com.github.bitfexl.notammap.repository.entities.types.IdentifierType;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class ExtractionService {
    public enum NotamSource {
        FAA,
        NATS
    }

    @Inject
    Event<SearchCompletedEvent> searchCompletedEvent;

    @Inject
    FAANotamExtractor faaNotamExtractor;

    @Inject
    NATSExtractor natsExtractor;

    @Inject
    ICAOIdentifierRepository icaoIdentifierRepository;

    @Inject
    ICAOIdentifierSearchRepository icaoIdentifierSearchRepository;

    public record SearchResult(String searchString, Instant startTimestamp, Instant insertStartTimestamp, Instant endTimestamp, int totalRecords, int newRecords) { }

    /**
     * Searches for icao aerodrome ids and returns the number of new ids inserted.
     * @param search The search string.
     * @return The result of the search
     */
    public Uni<SearchResult> searchAerodromes(String search) {
        final Instant startTimestamp = Instant.now();
        return natsExtractor.searchAerodromes(search).onItem().transform(
                (result) -> {
                    final Instant insertStartTimestamp = Instant.now();
                    final int newRecords = insertSearchResults(search, result, "NATS");
                    final Instant endTimestamp = Instant.now();
                    return new SearchResult(search, startTimestamp, insertStartTimestamp, endTimestamp, result.size(), newRecords);
                }
        );
    }

    public Uni<List<FIRSearchResult>> searchFIRs(String search) {
        return faaNotamExtractor.searchFIRs(search);
    }

    @Transactional
    int insertSearchResults(String searchString, List<AerodromeSearchResult> searchResults, String source) {
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

    // TODO: methods to extract known fir, ad notams (skip icao id check)

    public List<ExtractedNotamData> extractNotams(NotamSource source, List<String> icaoIds) {
        return extractNotams(source == NotamSource.FAA ? faaNotamExtractor : natsExtractor, icaoIds);
    }

    private List<ExtractedNotamData> extractNotams(NOTAMClient notamClient, List<String> icaoIds) {
        // TODO: make this reactive

        // faa client does not care if notams are for fir or ad
        final List<String> firIds = notamClient instanceof FAANotamExtractor ? List.of() : filterFIRIds(icaoIds).await().indefinitely();

        final List<String> adIds = firIds.isEmpty() ? icaoIds : icaoIds.stream().filter(id -> !firIds.contains(id)).toList();

        return extractNotams(notamClient, firIds, adIds);
    }

    private List<ExtractedNotamData> extractNotams(NOTAMClient notamClient, List<String> firIds, List<String> adIds) {
        // todo: make this reactive

        final List<ExtractedNotamData> extractedNotams = new ArrayList<>();

        for (int i = 0; i < firIds.size(); i += notamClient.getMaxFIRQueryCount()) {
            extractedNotams.addAll(
                    notamClient.queryFIRNotams(firIds.subList(i, Math.min(firIds.size(), i + notamClient.getMaxFIRQueryCount())))
                            .await().indefinitely()
            );
        }

        for (int i = 0; i < adIds.size(); i += notamClient.getMaxADQueryCount()) {
            extractedNotams.addAll(
                    notamClient.queryFIRNotams(adIds.subList(i, Math.min(adIds.size(), i + notamClient.getMaxADQueryCount())))
                            .await().indefinitely()
            );
        }

        return extractedNotams;
    }

    private Uni<List<String>> filterFIRIds(List<String> icaoIds) {
        // TODO: implement fir filter
        return Uni.createFrom().item(List.of());
    }
}
