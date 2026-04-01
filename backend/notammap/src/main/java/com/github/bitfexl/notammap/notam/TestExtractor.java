package com.github.bitfexl.notammap.notam;

import com.github.bitfexl.notammap.config.NatsEadConfig;
import com.github.bitfexl.notammap.notam.extraction.faa.FAANotamExtractor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class TestExtractor {
    @Inject
    NatsEadConfig config;

    final FAANotamExtractor notamExtractor = new FAANotamExtractor();

    public String getConfig() {
        return notamExtractor.queryADNotams(List.of("LOWL", "LOVV")).getFirst();
        // return config.username() + " " + config.password();
    }
}
