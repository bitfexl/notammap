package com.github.bitfexl.notammap.producer;

import com.github.bitfexl.notammap.notam.extraction.faa.FAANotamExtractor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;

@ApplicationScoped
public class NotamClientsProducer {
    @Produces
    public FAANotamExtractor produceFAANotamExtractor() {
        return new FAANotamExtractor();
    }
}
