package com.github.bitfexl.notammap.service;

import com.github.bitfexl.notammap.event.SearchCompletedEvent;
import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamData;
import com.github.bitfexl.notammap.notam.extraction.NOTAMClient;
import com.github.bitfexl.notammap.notam.extraction.faa.FAANotamExtractor;
import com.github.bitfexl.notammap.notam.extraction.natsead.FIRSearchResult;
import com.github.bitfexl.notammap.notam.extraction.natsead.NATSExtractor;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;

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

    public void searchAerodromes(String query) {

    }

    public Uni<List<FIRSearchResult>> searchFIRs(String search) {
        return faaNotamExtractor.searchFIRs(search);
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
