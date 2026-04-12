package com.github.bitfexl.notammap.service;

import com.github.bitfexl.notammap.event.SearchCompletedEvent;
import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamData;
import com.github.bitfexl.notammap.notam.extraction.NOTAMClient;
import com.github.bitfexl.notammap.notam.extraction.faa.FAANotamExtractor;
import com.github.bitfexl.notammap.notam.extraction.natsead.NATSExtractor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class ExtractionService {
    @Inject
    Event<SearchCompletedEvent> searchCompletedEvent;

    @Inject
    FAANotamExtractor faaNotamExtractor;

    @Inject
    NATSExtractor natsExtractor;

    public List<String> extractFaaNotams(String[] icaIds) {
        return List.of();
//        return extractNotams(faaNotamExtractor, List.of(icaIds));
    }

    public void searchAerodromes(String query) {

    }

    public void searchFIRs(String search) {
//        faaNotamExtractor.searchFIRs(search).
    }

    private List<ExtractedNotamData> extractNotams(NOTAMClient notamClient, List<String> icaoIds) {
        final List<String> firIds = filterFIRIds(icaoIds);
        final List<String> adIds = icaoIds.stream().filter(id -> !firIds.contains(id)).toList();

        final List<ExtractedNotamData> extractedNotams = new ArrayList<>();

        for (int i = 0; i < firIds.size(); i += notamClient.getMaxFIRQueryCount()) {
            extractedNotams.addAll(notamClient.queryFIRNotams(firIds.subList(i, Math.min(firIds.size(), i + notamClient.getMaxFIRQueryCount()))));
        }

        for (int i = 0; i < adIds.size(); i += notamClient.getMaxADQueryCount()) {
            extractedNotams.addAll(notamClient.queryFIRNotams(adIds.subList(i, Math.min(adIds.size(), i + notamClient.getMaxADQueryCount()))));
        }

        return extractedNotams;
    }

    private List<String> filterFIRIds(List<String> icaoIds) {
        return null;
    }
}
