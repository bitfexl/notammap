package com.github.bitfexl.notamextractor;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.github.bitfexl.notamextractor.dins.DinsQuery;
import com.github.bitfexl.notamextractor.dins.ICAOLocation;
import com.github.bitfexl.notamextractor.notamparser.Notam;
import com.github.bitfexl.notamextractor.notamparser.NotamParser;
import com.github.bitfexl.notamextractor.notamparser.detailsparser.DetailedNotamParser;
import com.github.bitfexl.notamextractor.notamparser.detailsparser.data.NotamData;
import lombok.SneakyThrows;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class Main {
    private static final DinsQuery dinsQuery = new DinsQuery();
    private static final ObjectMapper objectMapper = new ObjectMapper().setSerializationInclusion(Include.NON_NULL);

    @SneakyThrows
    public static void main(String[] args) {
        // generateLocationJsonIndex();

        final List<ICAOLocation> allLocations = loadLocationJsonIndex();

//        final List<String> countries = Arrays.stream(args).map(c -> c.replace("_", " ")).toList();
        // ignore united states countries as us notam format currently is not supported
        final List<String> countries = allLocations.stream().map(ICAOLocation::country).distinct().filter(c -> !c.startsWith("United States")).toList();
        final List<String> successfulCountries = new ArrayList<>();

        final ObjectWriter writer = objectMapper.writerWithDefaultPrettyPrinter();

        for (String countryName : countries) {
            final List<ICAOLocation> filteredLocations = allLocations.stream().filter(loc -> loc.country().equalsIgnoreCase(countryName)).toList();

            try {
                final NotamData data = generateNotamsJson(filteredLocations);
                if (data.notams().isEmpty()) {
                    continue;
                }
                writer.writeValue(new File(countryName.replace(" ", "_") + ".json"), data);
                successfulCountries.add(countryName);
            } catch (Exception ex) {
                System.err.println("Error querying notams for " + countryName + ".");
                ex.printStackTrace();
            }
        }

        writer.writeValue(new File("countries.json"), successfulCountries);
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
                // TODO: properly write these notams to file and load in frontend
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