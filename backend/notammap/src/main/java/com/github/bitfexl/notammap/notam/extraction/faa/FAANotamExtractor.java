package com.github.bitfexl.notammap.notam.extraction.faa;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bitfexl.notammap.notam.extraction.NOTAMClient;
import io.quarkus.arc.Arc;
import io.quarkus.arc.InstanceHandle;
import io.quarkus.logging.Log;
import lombok.SneakyThrows;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FAANotamExtractor implements NOTAMClient {
    private static final int MAX_PER_QUERY = 50;

    private final URI uri = URI.create("https://notams.aim.faa.gov/notamSearch/search");

    private final HttpClient httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.ALWAYS).build();

    @Override
    public List<String> queryADNotams(List<String> icaoIds) {
        final String s = queryNotams(icaoIds);
        return List.of(s);
    }

    @Override
    public int getMaxADQueryCount() {
        return MAX_PER_QUERY;
    }

    @Override
    public List<String> queryFIRNotams(List<String> icaoIds) {
        return List.of();
    }

    @Override
    public int getMaxFIRQueryCount() {
        return MAX_PER_QUERY;
    }

    private String queryNotams(List<String> icaoIds) {
        if (icaoIds.size() > 99999) {
            throw new IllegalArgumentException("Can handle ... icao ids at max.");
        }

        final String icaoIdsString = String.join(",", icaoIds);

        final String query = "searchType=0&designatorsForLocation=" + icaoIdsString;

        final List<JsonNode> notams = new ArrayList<>();

        int notamsCount;

        String nextQuery = query;

        do {
            final JsonNode queryResult = queryNotamsHandled(nextQuery);

            notamsCount = queryResult.get("totalNotamCount").asInt();

            final int endRecord = queryResult.get("endRecordCount").asInt();

            queryResult.get("notamList").forEach(notams::add);

            nextQuery = query + "&offset=" + endRecord + "&notamsOnly=false";
        } while (notams.size() < notamsCount);

        return notams.toString();
    }

    private JsonNode queryNotamsHandled(String query) {
        try {
            return queryNotams(query);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while querying notams.");
        } catch (Exception ex) {
            throw new RuntimeException("Exception while querying notams.", ex);
        }
    }

    private JsonNode queryNotams(String query) throws IOException, InterruptedException {
        final HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .header("Accept", "application/json")
                .header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36")
                .POST(HttpRequest.BodyPublishers.ofString(query, StandardCharsets.UTF_8))
                .build();

        final HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

        try (final InputStream in = response.body()) {
            if (response.statusCode() < 200 || response.statusCode() > 299 || in == null) {
                throw new RuntimeException("Error processing response. status code: " + response.statusCode() + ", body is null: " + (in == null));
            }

            try (final InstanceHandle<ObjectMapper> mapper = Arc.container().instance(ObjectMapper.class)) {
                if (!mapper.isAvailable()) {
                    throw new RuntimeException("ObjectMapper not available.");
                }

                return mapper.get().readTree(in);
            }
        }
    }

    private void extractNotams(JsonNode json) {

    }
}