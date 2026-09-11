package com.github.bitfexl.notammap.event;

import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamData;
import com.github.bitfexl.notammap.service.ExtractionService;

import java.util.List;

/**
 * Fired when notams are extracted.
 * @param source The source.
 * @param adIds The aerodrome ids, this may also conatin fir ids if fir ids is null.
 * @param firIds The fir ids or null.
 * @param notams The notams extracted.
 */
public record RawNotamExtractedEvent(
        ExtractionService.NotamSource source,
        List<String> adIds,
        List<String> firIds,
        List<ExtractedNotamData> notams
) {
}
