package com.github.bitfexl.notammap.notam.extraction.faa;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamData;
import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamDataString;
import com.github.bitfexl.notammap.notam.extraction.NOTAMClient;
import io.quarkus.arc.Arc;
import io.quarkus.arc.InstanceHandle;
import io.quarkus.logging.Log;
import jakarta.json.Json;
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
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class FAANotamExtractor implements NOTAMClient {
    private static final int MAX_PER_QUERY = 9999; // there seems to be no limit

    private static final String INVALID_LOCATIONS_STRING = "Invalid location(s):";

    private final URI uri = URI.create("https://notams.aim.faa.gov/notamSearch/search");

    private final HttpClient httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.ALWAYS).build();

    @Override
    public List<ExtractedNotamData> queryADNotams(List<String> icaoIds) {
        return queryNotams(icaoIds).stream().map(s -> (ExtractedNotamData) new ExtractedNotamDataString(s)).toList();
    }

    @Override
    public int getMaxADQueryCount() {
        return MAX_PER_QUERY;
    }

    @Override
    public List<ExtractedNotamData> queryFIRNotams(List<String> icaoIds) {
        return queryNotams(icaoIds).stream().map(s -> (ExtractedNotamData) new ExtractedNotamDataString(s)).toList();
    }

    @Override
    public int getMaxFIRQueryCount() {
        return MAX_PER_QUERY;
    }

    private List<String> queryNotams(List<String> icaoIds) {
        if (icaoIds.size() > MAX_PER_QUERY) {
            throw new IllegalArgumentException("Can only query " + MAX_PER_QUERY + " icao ids at once.");
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

        return notams.stream().map(n -> n.get("icaoMessage").asText()).toList();
    }

    private JsonNode queryNotamsHandled(String query) {
        final JsonNode response;
        try {
            response = queryNotams(query);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while querying notams.");
        } catch (Exception ex) {
            throw new RuntimeException("Exception while querying notams.", ex);
        }

        errorHandling: if (response.has("error")) {
            final String errorString = response.get("error").asText();
            if (errorString.isEmpty()) {
                break errorHandling;
            }

            if (errorString.startsWith(INVALID_LOCATIONS_STRING)) {
                final String[] invalidLocations = errorString.substring(INVALID_LOCATIONS_STRING.length()).split(",");
                // list of single quoted strings
                final List<String> invalidIcaoIds = Stream.of(invalidLocations)
                        .map(id -> {
                            id = id.trim();
                            return id.substring(1, id.length() - 1);
                        }).toList();
                throw new InvalidIcaoIdsException(invalidIcaoIds);
            } else {
                throw new RuntimeException("FAA NOTAMS api returned an error: " + errorString);
            }
        }

        return response;
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

//                final String s = new String(in.readAllBytes(), StandardCharsets.UTF_8);
//                Log.info(s);
                return mapper.get().readTree(in);
            }
        }
    }
}