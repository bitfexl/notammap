package com.github.bitfexl.notammap.producer;

import com.github.bitfexl.notammap.config.NatsEadConfig;
import com.github.bitfexl.notammap.notam.extraction.faa.FAANotamExtractor;
import com.github.bitfexl.notammap.notam.extraction.natsead.NATSExtractor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

@ApplicationScoped
public class NotamClientsProducer {
    @Inject
    NatsEadConfig natsEadConfig;

    @Produces
    public FAANotamExtractor produceFAANotamExtractor() {
        return new FAANotamExtractor();
    }

    @Produces
    public NATSExtractor produceNATSExtractor() {
        final NATSExtractor natsExtractor = new NATSExtractor(() -> new ChromeDriver(new ChromeOptions().addArguments("--headless")), natsEadConfig.username(), natsEadConfig.password());

        return natsExtractor;
    }
}
