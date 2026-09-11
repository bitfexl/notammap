package com.github.bitfexl.notammap.service;

import com.github.bitfexl.notammap.event.RawNotamExtractedEvent;
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
    public enum NotamSource {
        FAA,
        NATS
    }

    @Inject
    Event<RawNotamExtractedEvent> rawNotamExtractedEvent;

    @Inject
    FAANotamExtractor faaNotamExtractor;

    @Inject
    NATSExtractor natsExtractor;

    @Inject
    IcaoCodeLookupService icaoCodeLookupService;

    // TODO: methods to extract known fir, ad notams (skip icao id check)

    public List<ExtractedNotamData> extractNotams(NotamSource source, List<String> icaoIds) {
        return extractNotams(source, source == NotamSource.FAA ? faaNotamExtractor : natsExtractor, icaoIds);
    }

    private List<ExtractedNotamData> extractNotams(NotamSource notamSource, NOTAMClient notamClient, List<String> icaoIds) {
        // TODO: make this reactive

        // faa client does not care if notams are for fir or ad
        final List<String> firIds = notamClient instanceof FAANotamExtractor ? null : icaoCodeLookupService.getFIRIdentifiers(icaoIds);

        final List<String> adIds = firIds == null || firIds.isEmpty() ? icaoIds.stream().toList() : icaoIds.stream().filter(id -> !firIds.contains(id)).toList();

        final List<String> invalidIds = icaoCodeLookupService.getNonExistentIdentifiers(icaoIds);

        if (!invalidIds.isEmpty()) {
            throw new IllegalArgumentException("Unknown identifier(s): " + String.join(", ", invalidIds));
        }

        return extractNotams(notamSource, notamClient, adIds, firIds);
    }

    private List<ExtractedNotamData> extractNotams(NotamSource notamSource, NOTAMClient notamClient, List<String> adIds, List<String> firIds) {
        // todo: make this reactive

        final List<ExtractedNotamData> extractedNotams = new ArrayList<>();

        for (int i = 0; i < adIds.size(); i += notamClient.getMaxADQueryCount()) {
            extractedNotams.addAll(
                    notamClient.queryADNotams(adIds.subList(i, Math.min(adIds.size(), i + notamClient.getMaxADQueryCount())))
                            .await().indefinitely()
            );
        }

        if (firIds != null) {
            for (int i = 0; i < firIds.size(); i += notamClient.getMaxFIRQueryCount()) {
                extractedNotams.addAll(
                        notamClient.queryFIRNotams(firIds.subList(i, Math.min(firIds.size(), i + notamClient.getMaxFIRQueryCount())))
                                .await().indefinitely()
                );
            }
        }

        // fire event and process all extracted notams, regardless where the extraction was initiated from
        rawNotamExtractedEvent.fire(new RawNotamExtractedEvent(notamSource, adIds, firIds, extractedNotams));

        return extractedNotams;
    }
}
