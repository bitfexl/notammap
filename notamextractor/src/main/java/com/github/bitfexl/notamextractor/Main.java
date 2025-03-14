package com.github.bitfexl.notamextractor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bitfexl.notamextractor.dins.DinsQuery;
import com.github.bitfexl.notamextractor.dins.ICAOLocation;
import lombok.SneakyThrows;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        generateLocationJsonIndex();
    }

    @SneakyThrows
    public static void generateLocationJsonIndex() {
        final DinsQuery dinsQuery = new DinsQuery();
        final ObjectMapper objectMapper = new ObjectMapper();

        final List<ICAOLocation> locations = dinsQuery.getAllIcaoLocations();

        final String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(locations);

        System.out.println(json);
    }
}