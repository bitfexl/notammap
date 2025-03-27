package com.github.bitfexl.notamextractor.notamparser;

import java.util.*;

/**
 * Parse notams according to Icao Doc 8126
 * https://www.icao.int/NACC/Documents/eDOCS/AIM/8126_unedited_en%20Jul2021.pdf
 */
public class NotamParser {
    private final String CREATED_PREFIX = "CREATED:";
    private final String SOURCE_PREFIX = "SOURCE:";

    /**
     * Parse a notam according to ICAO Annex 15 Appendix 6.
     * @param rawNotam The raw notam text.
     * @return The parsed notam.
     */
    public Notam parse(final String rawNotam) {
        final Notam.NotamBuilder notam = Notam.builder().raw(rawNotam);

        final String[] lines = rawNotam.split("\n", 2);

        if (lines.length != 2) {
            // might happen in NOTAMC?
            throw new IllegalArgumentException("Only header???");
        }

        parseHeader(notam, lines[0]);

        // parse created and source
        List<String> notamBody = new ArrayList<>(List.of(lines[1].split("\n")));

        if (notamBody.size() > 2) {
            String s;
            if ((s = notamBody.get(notamBody.size() - 2)).startsWith(CREATED_PREFIX)) {
                notam.created(s.substring(CREATED_PREFIX.length()).trim());
                notamBody.remove(notamBody.size() - 2);
            }
            if ((s = notamBody.get(notamBody.size() - 1)).startsWith(SOURCE_PREFIX)) {
                notam.source(s.substring(SOURCE_PREFIX.length()).trim());
                notamBody.remove(notamBody.size() - 1);
            }
        }

        Map<Character, String> items = parseItems(String.join(" ", notamBody));

        for (char item : items.keySet()){
            switch (item) {
                case 'Q': parseItemQ(notam, items.get(item)); break;
                case 'A': parseItemA(notam, items.get(item)); break;
                case 'B': parseItemB(notam, items.get(item)); break;
                case 'C': parseItemC(notam, items.get(item)); break;
                case 'D': parseItemD(notam, items.get(item)); break;
                case 'E': parseItemE(notam, items.get(item)); break;
                case 'F': parseItemF(notam, items.get(item)); break;
                case 'G': parseItemG(notam, items.get(item)); break;
                default: throw new IllegalArgumentException("Unknown item '" + item + "'.");
            }
        }

        return notam.build();
    }

    private void parseHeader(Notam.NotamBuilder notam, String header) {
        String[] parts = header.split("[/ ]");
        notam.series(parts[0].charAt(0));
        notam.number(Integer.parseInt(parts[0].substring(1)));

        notam.year(parseYear(Integer.parseInt(parts[1])));

        final NotamType type = NotamType.parse(parts[2]);
        notam.type(type);

        if (type != NotamType.NEW) {
            notam.previousNotam(
                Notam.builder()
                    .series(parts[3].charAt(0))
                    .number(Integer.parseInt(parts[3].substring(1)))
                    .year(parseYear(Integer.parseInt(parts[4])))
                    .build()
            );
        }
    }

    /**
     * Get a map of every item in the notam.
     * @param raw The notam without header and CREATED, SOURCE at the bottom (from dins?), singele line.
     * @return A map of every item contained in the notam.
     */
    private Map<Character, String> parseItems(String raw) {
        Map<Character, String> items = new HashMap<>();

        Character currentItem = null;
        int currentStartingIndex = 0;

        for (char item : new char[] {'Q', 'A', 'B', 'C', 'D', 'E', 'F', 'G'}) {
            // Q is the first item, so no space
            final String nextItemName = item == 'Q' ? "Q) " : " " + item + ") ";

            final int nextItemIndex;

            // item F and G are after item E but item E might contain " F) " or " G) "

            if (item == 'F' || item == 'G') {
                nextItemIndex = raw.lastIndexOf(nextItemName);
            } else {
                nextItemIndex = raw.indexOf(nextItemName, currentStartingIndex);
            }

            if (nextItemIndex == -1) {
                // item does not exist
                continue;
            }

            // item D is optional and " D) " might be contained in item E

            if (item == 'D') {
                final int itemEIndex = raw.indexOf(" E) ", currentStartingIndex);
                if (itemEIndex != -1 && itemEIndex < nextItemIndex) {
                    // skip as item D does not exist (string is contained in item E)
                    continue;
                }
            }

            if (currentItem != null) {
                items.put(currentItem, raw.substring(currentStartingIndex, nextItemIndex));
            }

            currentItem = item;
            currentStartingIndex = nextItemIndex + nextItemName.length();
        }

        if (currentItem != null) {
            items.put(currentItem, raw.substring(currentStartingIndex));
        }

        return items;
    }

    private void parseItemQ(Notam.NotamBuilder notam, String itemQ) {
        // 8 fields separated by a stroke
        String[] parts = itemQ.split("/");

        notam.fir(parts[0].trim());
        notam.notamCode(parts[1]);
        if (!parts[2].isEmpty()) {
            notam.traffic(Traffic.parse(parts[2]));
        }
        if (!parts[3].isEmpty()) {
            notam.purposes(NotamPurpose.parse(parts[3]));
        }
        if (!parts[4].isEmpty()) {
            notam.scopes(NotamScope.parse(parts[4]));
        }
        if (!parts[5].isEmpty()) {
            notam.qLower(Integer.parseInt(parts[5]));
        }
        if (!parts[6].isEmpty()) {
            notam.qUpper(Integer.parseInt(parts[6]));
        }
        if (!parts[7].isEmpty()) {
            parseCordsItemQ(notam, parts[7]);
        }
    }

    private void parseItemA(Notam.NotamBuilder notam, String itemA) {
        notam.locationIndicators(Arrays.stream(itemA.split(" ")).filter(l -> l.length() > 0).toList());
    }

    private void parseItemB(Notam.NotamBuilder notam, String itemB) {
        notam.from(parseDateTimeGroup(itemB));
    }

    private void parseItemC(Notam.NotamBuilder notam, String itemC) {
        if (itemC.equalsIgnoreCase("PERM")) {
            notam.isPermanent(true);
        } else {
            notam.to(parseDateTimeGroup(itemC));
            notam.isEstimation(itemC.contains("EST"));
        }
    }

    private void parseItemD(Notam.NotamBuilder notam, String itemD) {
        notam.schedule(itemD);
    }

    private void parseItemE(Notam.NotamBuilder notam, String itemE) {
        notam.notamText(itemE);
    }

    private void parseItemF(Notam.NotamBuilder notam, String itemF) {
        notam.lowerLimit(itemF);
    }

    private void parseItemG(Notam.NotamBuilder notam, String itemG) {
        notam.upperLimit(itemG);
    }

    private void parseCordsItemQ(Notam.NotamBuilder notam, String cords) {
        // https://en.wikipedia.org/wiki/ISO_6709

        // if missing/incorrect cords
        if (cords.length() <= 3) {
            notam.radius(Integer.parseInt(cords));
            return;
        }

        double lat = Double.parseDouble(cords.substring(0, 2));
        lat += (Double.parseDouble(cords.substring(2, 4)) / 60);
        lat *= (cords.charAt(4) == 'S' || cords.charAt(4) == 's' ? -1 : 1);
        notam.latitude(lat);

        double lng = Double.parseDouble(cords.substring(5, 8));
        lng += (Double.parseDouble(cords.substring(8, 10)) / 60);
        lng *= (cords.charAt(10) == 'W' || cords.charAt(10) == 'w' ? -1 : 1);
        notam.longitude(lng);

        notam.radius(Integer.parseInt(cords.substring(11)));
    }

    /**
     * Parse a ICAO date-time group to ISO 8601.
     */
    private String parseDateTimeGroup(String s) {
        return parseYear(Integer.parseInt(s.substring(0, 2))) + "-" + s.substring(2, 4) + "-" + s.substring(4, 6) + "T" + s.substring(6, 8) + ":" + s.substring(8, 10) + ":00Z";
    }

    private int parseYear(int twoDigitYear) {
        return 2000 + twoDigitYear;
    }
}
