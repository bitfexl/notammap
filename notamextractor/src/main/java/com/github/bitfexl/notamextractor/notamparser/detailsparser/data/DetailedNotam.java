package com.github.bitfexl.notamextractor.notamparser.detailsparser.data;

import com.github.bitfexl.notamextractor.notamparser.Notam;

import java.util.List;

/**
 * A data class describing details to a parsed notam.
 * The original notam is provided along with useful details.
 * @param notam         The notam this details describe.
 * @param id            The unique notam id.
 * @param previousNotamId The id of the previous notam if it exists or null.
 * @param textNodes     The notam text as preprocessed text nodes.
 * @param activePeriods A list of periods where the notam is active.
 *                      Must be a complete list if present.
 */
public record DetailedNotam(Notam notam, Long id, Long previousNotamId, List<TextNode> textNodes, List<Period> activePeriods) {
}
