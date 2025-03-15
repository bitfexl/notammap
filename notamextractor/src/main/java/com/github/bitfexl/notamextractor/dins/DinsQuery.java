package com.github.bitfexl.notamextractor.dins;

import lombok.SneakyThrows;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.ArrayList;
import java.util.List;

public class DinsQuery {
    private static final String ICAO_INDEX_URL = "https://www.notams.faa.gov/common/icao/index.html";
    private static final String USA_INDEX_URL = "https://www.notams.faa.gov/common/icao/USA.html";
    private static final String QUERY_API_URL = "https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do";

    /**
     * Get all notams to the given icao locations.
     * @param locations The locations to query. If more than 50 multiple queries will be sent.
     * @return All the notams to the locations.
     */
    public List<String> getNotams(List<ICAOLocation> locations) {
        final List<String> notams = new ArrayList<>();

        for (int i = 0; i < locations.size(); i += 50) {
            notams.addAll(_50NotamsByICAOIdentifiers(locations.subList(i, Math.min(locations.size(), i + 50)).stream().map(ICAOLocation::icao).toList()));
        }

        return notams;
    }

    @SneakyThrows
    private List<String> _50NotamsByICAOIdentifiers(List<String> ICAOIdentifiers) {
        if (ICAOIdentifiers.size() > 50) {
            throw new IllegalArgumentException("Can only query up to 50 ICAO identifiers at once.");
        }

        final Document document = Jsoup.connect(QUERY_API_URL)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .requestBody(
                        "reportType=Raw&retrieveLocId=" +
                        String.join("+", ICAOIdentifiers) +
                        "&actionType=notamRetrievalByICAOs&submit=View+NOTAMs"
                ).post();

        return document.getElementsByTag("pre").stream().map(Element::text).toList();
    }

    /**
     * Get all icao locations form a static site from the dins.
     * @return A list of icao locations for each country or state in the US.
     */
    public List<ICAOLocation> getAllIcaoLocations() {
        final List<ICAOLocation> locations = new ArrayList<>();

        final List<String> pages = getIcaoCountryPages(ICAO_INDEX_URL);
        for (String countryPageUrl : pages) {
            if (isIcaoUSALocations(countryPageUrl)) {
                for (String usaCountryPageUrl : getIcaoCountryPages(countryPageUrl)) {
                    locations.addAll(getIcaoLocations(usaCountryPageUrl, true));
                }
            } else {
                locations.addAll(getIcaoLocations(countryPageUrl, false));
            }
        }

        return locations;
    }

    @SneakyThrows
    private List<String> getIcaoCountryPages(String countryPageIndexUrl) {
        final Document document = Jsoup.connect(countryPageIndexUrl).get();
        final Elements links = document.getElementsByTag("a");
        return links.stream().map(a -> a.attr("abs:href")).toList();
    }

    private boolean isIcaoUSALocations(String countryPageUrl) {
        return USA_INDEX_URL.equals(countryPageUrl);
    }

    @SneakyThrows
    private List<ICAOLocation> getIcaoLocations(String countryPageUrl, boolean usaSublocation) {
        final Document document = Jsoup.connect(countryPageUrl).get();
        final Elements rows = document.getElementsByTag("tr");
        final String countryName = usaSublocation ? "United States " + rows.getFirst().text() : rows.getFirst().text();

        final List<ICAOLocation> locations = new ArrayList<>();

        for (int i = 2; i < rows.size(); i++) {
            final Elements tds = rows.get(i).getElementsByTag("td");

            if (!usaSublocation) {
                locations.add(new ICAOLocation(countryName, tds.getFirst().text(), tds.get(1).text()));
            } else {
                locations.add(new ICAOLocation(countryName, tds.get(1).text(), tds.get(2).text()));
            }
        }

        return locations;
    }
}
