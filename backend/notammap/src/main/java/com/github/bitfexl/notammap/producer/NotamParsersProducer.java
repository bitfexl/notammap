package com.github.bitfexl.notammap.producer;

import com.github.bitfexl.notammap.notam.parser.NotamParser;
import com.github.bitfexl.notammap.notam.parser.detailsparser.DetailedNotamParser;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;

@ApplicationScoped
public class NotamParsersProducer {
    @Produces
    public NotamParser notamParser() {
        return new NotamParser();
    }

    @Produces
    public DetailedNotamParser detailedNotamParser() {
        return new DetailedNotamParser();
    }
}
