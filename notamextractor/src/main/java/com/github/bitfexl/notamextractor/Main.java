package com.github.bitfexl.notamextractor;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bitfexl.notamextractor.dins.DinsQuery;
import com.github.bitfexl.notamextractor.dins.ICAOLocation;
import com.github.bitfexl.notamextractor.notamparser.Notam;
import com.github.bitfexl.notamextractor.notamparser.NotamParser;
import com.github.bitfexl.notamextractor.notamparser.detailsparser.DetailedNotamParser;
import com.github.bitfexl.notamextractor.notamparser.detailsparser.data.NotamData;
import lombok.SneakyThrows;

import java.io.InputStream;
import java.io.PrintStream;
import java.util.List;

public class Main {
    private static final DinsQuery dinsQuery = new DinsQuery();
    private static final ObjectMapper objectMapper = new ObjectMapper().setSerializationInclusion(Include.NON_NULL);

    @SneakyThrows
    public static void main(String[] args) {
        // generateLocationJsonIndex();

        final List<ICAOLocation> allLocations = loadLocationJsonIndex();

        for (String countryName : args) {
            final List<ICAOLocation> filteredLocations = allLocations.stream().filter(loc -> loc.country().equalsIgnoreCase(countryName)).toList();

            try (PrintStream file = new PrintStream(countryName + ".json")) {
                file.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(generateNotamsJson(filteredLocations)));
            }
        }
    }

    @SneakyThrows
    private static NotamData generateNotamsJson(List<ICAOLocation> locations) {
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

        return new DetailedNotamParser().parseNotams(parsedNotams);
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