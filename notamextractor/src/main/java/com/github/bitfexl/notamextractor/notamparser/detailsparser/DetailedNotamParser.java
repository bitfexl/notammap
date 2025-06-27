package com.github.bitfexl.notamextractor.notamparser.detailsparser;

import com.github.bitfexl.notamextractor.notamparser.Notam;
import com.github.bitfexl.notamextractor.notamparser.detailsparser.data.*;

import java.util.*;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class DetailedNotamParser {
    private static final String NOTAM_DATA_VERSION = "1.0";
    private static final byte ID_VERSION = 1;
    // some latitudes are incorrectly represented without the leading 0 hence 6,7 for latitude matching
    private static final Pattern COORDINATES_PATTERN = Pattern.compile("(?:\\d{6}[NS]\\s*\\d{6,7}[EW](?:\\s*[-/]?\\s*)?)+");

    /**
     * Generate notam data with details for a number of notams.
     * @param notams The notams to extract details for.
     * @return The parsed data.
     */
    public NotamData parseNotams(List<Notam> notams) {
        final Map<Long, DetailedNotam> detailedNotams = new HashMap<>();
        final Map<String, CoordinatesList> coordinates = new HashMap<>();

        for (Notam notam : notams) {
            final long notamId = computeId(notam);

            if (!detailedNotams.containsKey(notamId)) {
                detailedNotams.put(notamId, new DetailedNotam(
                        notam,
                        notamId,
                        notam.getPreviousNotam() == null ? null : computeId(notam.getPreviousNotam(), notam.getFir()),
                        parseTextNodes(notam, coordinates),
                        parsePeriods(notam)
                ));
            }
        }

        return new NotamData(
                NOTAM_DATA_VERSION,
                detailedNotams.values().stream().toList(),
                coordinates.values().stream().toList()
        );
    }

    private List<Period> parsePeriods(Notam notam) {
        // TODO: implement periods parsing
        return null;
    }

    /**
     * A text snippet inside a longer text.
     * @param start The start of the text snippet (inclusive).
     * @param end The end of the text snipped (exclusive).
     * @param node The node this text snippet represents.
     */
    private record TextSnippet(int start, int end, TextNode node) {}

    private List<TextNode> parseTextNodes(Notam notam, Map<String, CoordinatesList> coordinates) {
        // TODO: implement text nodes parsing
        final String text = notam.getNotamText();

        if (text == null) {
            return List.of();
        }

        final List<TextSnippet> textSnippets = new ArrayList<>();

        // --- find coordinates ---

        final Matcher matcher = COORDINATES_PATTERN.matcher(text);

        while (matcher.find()) {
            final String coordinatesGroup = matcher.group();
            final CoordinatesList coordinatesList = parseCoordinatesList(coordinatesGroup);
            coordinates.put(coordinatesList.hash(), coordinatesList);
            int end = matcher.end();
            if (coordinatesGroup.endsWith(" ")) {
                end--;
            }
            textSnippets.add(new TextSnippet(
                    matcher.start(), end, new TextNode(coordinatesGroup, Reference.coordinatesList(coordinatesList.hash()))
            ));
        }

        // --- find links ---

        final String[] words = text.split(" ");
        int linkStartIndex = 0;
        for (String word : words) {
            final String lowercaseWord = word.toLowerCase();
            if ((lowercaseWord.startsWith("https://") || lowercaseWord.startsWith("http://") || lowercaseWord.startsWith("www.")) && word.indexOf(".", 4) != -1) {
                textSnippets.add(new TextSnippet(linkStartIndex, linkStartIndex + word.length(),
                        new TextNode(word, Reference.webLink(lowercaseWord.charAt(0) == 'w' ? "https://" + word : word))
                ));
            }
            linkStartIndex += word.length() + 1; // + 1 for removed space
        }

        // --- build text node list ---

        final List<TextNode> textNodes = new ArrayList<>();

        textSnippets.sort(Comparator.comparingInt(TextSnippet::start));

        int startIndex = 0;

        for (TextSnippet snippet : textSnippets) {
            if (startIndex < snippet.start) {
                textNodes.add(new TextNode(text.substring(startIndex, snippet.start), null));
            } else if (startIndex > snippet.start) {
                throw new RuntimeException("Overlapping matches found.");
            }
            textNodes.add(snippet.node);
            startIndex = snippet.end;
        }

        if (startIndex != text.length() - 1) {
            textNodes.add(new TextNode(text.substring(startIndex), null));
        }

        return textNodes;
    }

    private CoordinatesList parseCoordinatesList(String rawCoordinatesList) {
        final List<String> rawCoordinates = Arrays.stream(rawCoordinatesList.split("[\\s-/]"))
                .flatMap(
                        (Function<String, Stream<String>>) s -> // parse different coordinate notations
                                s.length() == 7 || s.length() == 8 ? Stream.of(s) : // "123456N" or "1234567E" if notated as "123456N 1234567E"
                                s.length() == 15 ? Stream.of(s.substring(0, 7), s.substring(7)) : // "123456N1234567E"
                                Stream.of()) // ignore everything else
                .toList();

        if (rawCoordinates.size() % 2 != 0) {
            throw new IllegalArgumentException("Error parsing coordinates list: Coordinates list not in the correct format (latitude or longitude missing): '" + rawCoordinatesList + "'.");
        }

        final List<Coordinates> parsedCoordinates = new ArrayList<>();

        for (int i = 0; i < rawCoordinates.size(); i += 2) {
            parsedCoordinates.add(new Coordinates(parseCordPart(rawCoordinates.get(i)), parseCordPart(rawCoordinates.get(i + 1))));
        }

        // todo: maybe a better hash code
        final String hash = String.valueOf(parsedCoordinates.hashCode());
        return new CoordinatesList(hash, parsedCoordinates);
    }

    private double parseCordPart(String cordPart) {
        // https://en.wikipedia.org/wiki/ISO_6709 with 6 and 7 digits
        final int offset = cordPart.length() - 7;
        double cord = Double.parseDouble(cordPart.substring(0, 2 + offset));
        cord += (Double.parseDouble(cordPart.substring(2 + offset, 4 + offset)) / 60);
        cord += (Double.parseDouble(cordPart.substring(4 + offset, 6 + offset)) / 3600);
        // some longitudes are incorrectly represented without the leading "0"
        final char c = Character.toLowerCase(cordPart.charAt(6 + offset));
        if (c == 's' || c == 'w') {
            cord *= -1;
        }
        return cord;
    }

    private long computeId(Notam notam, String fir) {
        return computeId(notam.getYear(), notam.getSeries(), notam.getNumber(), fir);
    }

    private long computeId(Notam notam) {
        return computeId(notam.getYear(), notam.getSeries(), notam.getNumber(), notam.getFir());
    }

    /**
     * Compute a notam id.
     * @param year The year the notam was published.
     * @param series The series (a litter from A-Z without S and T).
     * @param number The number of the notam in the series.
     * @param fir The fir the notam was published in.
     * @return A unique id, always positive.
     */
    private long computeId(int year, char series, int number, String fir) {
        // 1 byte id version, first bit reserved to stay positive
        // 1 + 1/2 byte year (to 4095)
        // 2 + 1/2 byte series + number
        //   5 bit series (letter)
        //   1 byte + 7 bit number
        // 3 byte ifr
        //   4 bit padding
        //   20 bit = 4 letters (5 bit) fir

        long id = 0;

        id |= ID_VERSION;

        id = id << 12;
        id |= (year & 0xfff);

        byte seriesByte = letterToByte(series);
        if (seriesByte == -1) {
            throw new IllegalArgumentException("Series must be a single uppercase letter (A-Z), but got '" + series + "'.");
        }

        id = id << 5;
        id |= seriesByte;

        id = id << 15;
        id |= (number & 0x7fff);

        if (fir.length() != 4) {
            throw new IllegalArgumentException("FIR must be a four letter string (uppercase, A-Z), but got '" + fir + "'.");
        }

        id = id << 4;
        for (int i = 0; i < 4; i++) {
            byte ifrByte = letterToByte(fir.charAt(i));
            if (ifrByte == -1) {
                throw new IllegalArgumentException("FIR must consist of only uppercase letters (A-Z), but got '" + fir + "'.");
            }
            id = id << 5;
            id |= ifrByte;
        }

        return id;
    }

    private byte letterToByte(char letter) {
        if (letter < 65 || letter > 90) {
            return -1;
        }
        return (byte)(letter - 65);
    }

    private String longToBin(long num) {
        String bin = Long.toString(num, 2);
        bin = "0".repeat(64 - bin.length()) + bin;
        for (int i = 7; i >= 0; i--) {
            bin = bin.substring(0, i * 8) + " " + bin.substring(i * 8);
        }
        return bin;
    }
}
