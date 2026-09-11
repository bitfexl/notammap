package com.github.bitfexl.notammap.service;

import com.github.bitfexl.notammap.event.RawNotamExtractedEvent;
import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamData;
import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamDataString;
import com.github.bitfexl.notammap.notam.extraction.natsead.NATSNotam;
import com.github.bitfexl.notammap.util.ContentHasher;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;

import java.util.List;

@ApplicationScoped
public class NotamProcessingService {
    /**
     * Recreate the notam as the usually used string format. This is based on the extraction source
     * and does make some assumptions and basic formatting.
     * @param source The source the raw notam was extracted from.
     * @param notam The extracted raw notam, must be compatible to the source.
     * @return The raw text notam.
     */
    public String recreateRawNotam(ExtractionService.NotamSource source, ExtractedNotamData notam) {
        // recreate the raw formatted notam as it is normally distributed

        String rawNotamAsText;

        if (source == ExtractionService.NotamSource.FAA) {
            if (notam instanceof ExtractedNotamDataString s) {
                rawNotamAsText = s.getNotam();
            } else {
                throw new IllegalArgumentException();
            }

            // TODO: Preprocess this...
            if (rawNotamAsText.startsWith("ORIGINAL NOTAM")) {

            }
        } else if (source == ExtractionService.NotamSource.NATS) {
            if (notam instanceof NATSNotam nats) {
                // append the notam id and assume it is a new one, this is not correct
                // but the best possible as replacement information is not given by nats
                // replacement information must be taken from other sources and "notam is new" cannot be assumed correct for nats (in the ui)
                rawNotamAsText = nats.notamId() + " " + "NOTAMN\n" + nats.notam();
            } else {
                throw new IllegalArgumentException();
            }
        } else  {
            throw new IllegalArgumentException();
        }

        final String formattedRawNotam = formatRawTextNotam(rawNotamAsText);

        // further process that

        return formattedRawNotam;
    }

    /**
     * Raw notam hash of the recreated raw notam.
     * @param recreatedRawNotam {@link #recreateRawNotam(ExtractionService.NotamSource, ExtractedNotamData)} output.
     * @return The hash.
     */
    public String hashRawNotam(String recreatedRawNotam) {
        final ContentHasher contentHasher = new ContentHasher("com.github.bitfexl.notammap raw notam hash v1");
        contentHasher.put("notam", recreatedRawNotam);
        return contentHasher.toString();
    }

    public void onRawNotamExtracted(@Observes RawNotamExtractedEvent event) {
        final List<ExtractedNotamData> notams = event.notams();

        if (notams == null || notams.isEmpty()) {
            return;
        }

        for (ExtractedNotamData notam : notams) {
            processFormattedTextNotam(recreateRawNotam(event.source(), notam));
        }
    }

    private void processFormattedTextNotam(String notam) {
        // TODO: implement (parsing and db)
    }

    private String formatRawTextNotam(String rawNotam) {
        final String[] lines = rawNotam.split("\n");

        final StringBuilder formattedRawNotam = new StringBuilder();

        for (String line : lines) {
            if (!formattedRawNotam.isEmpty()) {
                formattedRawNotam.append("\n");
            }
            // keep leading whitespaces as those may be intended as formatting
            formattedRawNotam.append(line.stripTrailing());
        }

        // strip trailing again, sometimes a few empty lines are appended
        return formattedRawNotam.toString().stripTrailing();
    }
}
