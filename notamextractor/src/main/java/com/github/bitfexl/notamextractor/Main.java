package com.github.bitfexl.notamextractor;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bitfexl.notamextractor.dins.DinsQuery;
import com.github.bitfexl.notamextractor.dins.ICAOLocation;
import com.github.bitfexl.notamextractor.notamparser.Notam;
import com.github.bitfexl.notamextractor.notamparser.NotamParser;
import lombok.SneakyThrows;

import java.io.InputStream;
import java.util.List;

public class Main {
    private static final DinsQuery dinsQuery = new DinsQuery();
    private static final ObjectMapper objectMapper = new ObjectMapper().setSerializationInclusion(Include.NON_NULL);

    public static void main(String[] args) {
        // generateLocationJsonIndex();
        final List<ICAOLocation> locations = loadLocationJsonIndex();
        final ICAOLocation location = locations.get((int)(Math.random() * locations.size()));
        generateNotamsJson(List.of(location));
    }

    @SneakyThrows
    private static void generateNotamsJson(List<ICAOLocation> locations) {
        final NotamParser parser = new NotamParser();

        final List<String> notams = dinsQuery.getNotams(locations);

        final List<Notam> parsedNotams = notams.stream().map(notam -> {
            try {
                return parser.parse(notam);
            } catch (Exception ex) {
                System.err.println("Error parsing notam.");
                ex.printStackTrace();
                return Notam.builder().raw(notam).build();
            }
        }).toList();

        final String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(parsedNotams);
        System.out.println(json);
    }

    @SneakyThrows
    private static List<ICAOLocation> loadLocationJsonIndex() {
        try (InputStream inputStream = Main.class.getResourceAsStream("/icaoLocationIndex.json")) {
            return objectMapper.readValue(inputStream, new TypeReference<>(){});
        }
    }

    @SneakyThrows
    private static void generateLocationJsonIndex() {
        final List<ICAOLocation> locations = dinsQuery.getAllIcaoLocations();

        final String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(locations);

        System.out.println(json);
    }
}