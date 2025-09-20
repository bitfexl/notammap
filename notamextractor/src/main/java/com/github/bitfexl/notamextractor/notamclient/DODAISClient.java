package com.github.bitfexl.notamextractor.notamclient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.SneakyThrows;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * https://www.daip.jcs.mil/daip/mobile/index
 */
public class DODAISClient implements NotamClient {
    private static final URI QUERY_URL = URI.create("https://www.daip.jcs.mil/daip/mobile/query");

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final HttpClient httpClient;

    {
        // http client which does not check certificates as they are incorrect for source

        try {
            final TrustManager trustManager = new X509TrustManager() {
                @Override
                public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {

                }

                @Override
                public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {

                }

                @Override
                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[0];
                }
            };

            final SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, new TrustManager[] { trustManager } , null);

            httpClient = HttpClient.newBuilder().sslContext(sslContext).build();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    public List<String> queryNotmas(List<String> locations) {
        final List<String> notams = new ArrayList<>();

        for (int i = 0; i < locations.size(); i += 50) {
            notams.addAll(query50Notams(locations.subList(i, Math.min(locations.size(), i + 50))));
        }

        return notams;
    }

    @SneakyThrows
    private List<String> query50Notams(List<String> icaoIdentifiers) {
        if (icaoIdentifiers.size() > 50) {
            throw new IllegalArgumentException("Can only query up to 50 ICAO identifiers at once.");
        }

        final HttpRequest request = HttpRequest.newBuilder()
                .uri(QUERY_URL)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(getBody(icaoIdentifiers)))
                .build();

        final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Got response: " + response.statusCode());
        }

        return findNotams(response.body());
    }

    @SneakyThrows
    private List<String> findNotams(String response) {
        final JsonNode node = objectMapper.readTree(response);
        final List<String> notams = new ArrayList<>();
        iterateObjects(node, jsonObject -> {
            if (jsonObject.has("rawtext")) {
                notams.add(jsonObject.get("rawtext").asText().trim());
            }
        });
        return notams;
    }

    private void iterateObjects(JsonNode jsonNode, Consumer<ObjectNode> consumer) {
        if (jsonNode instanceof ObjectNode objectNode) {
            consumer.accept(objectNode);
        }

        if (jsonNode.isObject() || jsonNode.isArray()) {
            for (JsonNode child : jsonNode) {
                iterateObjects(child, consumer);
            }
        }
    }

    private String getBody(List<String> icaoIdentifiers) {
        return String.format("""
                          {
                          	"locs": "%s",
                          	"poa": "",
                          	"pod": "",
                          	"alternates": "",
                          	"route": "",
                          	"radius": "10",
                          	"runwayLength": "",
                          	"runwayWidth": "",
                          	"airportType": "",
                          	"type": "LOCATION",
                          	"notamId": "",
                          	"acode": "",
                          	"artcc": "",
                          	"tfrsOnly": "",
                          	"orgLoc": "",
                          	"lat1": "",
                          	"lat2": "",
                          	"lng1": "",
                          	"lng2": "",
                          	"latdir": "",
                          	"longdir": "",
                          	"includeRegulatoryNotices": "",
                          	"briefing": "",
                          	"scheduleDate": "",
                          	"sendTime": "",
                          	"active": "",
                          	"sunday": "",
                          	"monday": "",
                          	"tuesday": "",
                          	"wednesday": "",
                          	"thursday": "",
                          	"friday": "",
                          	"saturday": "",
                          	"sort": "Criticality"
                          }""", String.join(",", icaoIdentifiers)
        );
    }
}
