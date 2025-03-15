package com.github.bitfexl.notamextractor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bitfexl.notamextractor.dins.DinsQuery;
import com.github.bitfexl.notamextractor.dins.ICAOLocation;
import lombok.SneakyThrows;

import java.io.InputStream;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // generateLocationJsonIndex();
        final List<ICAOLocation> locations = loadLocationJsonIndex();
        final ICAOLocation location = locations.get((int)(Math.random() * locations.size()));
        final List<String> notams = new DinsQuery().getNotams(List.of(location));
        System.out.println("Notams for " + location.icao() + " "  + location.country() + " " + location.name());
        notams.forEach(System.out::println);
    }

    @SneakyThrows
    private static List<ICAOLocation> loadLocationJsonIndex() {
        final ObjectMapper objectMapper = new ObjectMapper();

        try (InputStream inputStream = Main.class.getResourceAsStream("/icaoLocationIndex.json")) {
            return objectMapper.readValue(inputStream, new TypeReference<>(){});
        }
    }

    @SneakyThrows
    private static void generateLocationJsonIndex() {
        final DinsQuery dinsQuery = new DinsQuery();
        final ObjectMapper objectMapper = new ObjectMapper();

        final List<ICAOLocation> locations = dinsQuery.getAllIcaoLocations();

        final String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(locations);

        System.out.println(json);
    }
}