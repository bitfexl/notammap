package com.github.bitfexl.notammap.notam.extraction.natsead;

import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamData;
import com.github.bitfexl.notammap.notam.extraction.NOTAMClient;
import org.openqa.selenium.WebDriver;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.function.Supplier;

public class NATSExtractor implements NOTAMClient {
    private final Supplier<WebDriver> webDriverFactory;

    private final String natsUsername, natsPassword;

    private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();

    private Future<?> cleanupFuture;

    private Instant lastTaskExecuted = null;

    private WebDriver webDriver;
    private NATSInteractor natsInteractor;

    public NATSExtractor(Supplier<WebDriver> webDriverFactory, String natsUsername, String natsPassword) {
        this.webDriverFactory = webDriverFactory;
        this.natsUsername = natsUsername;
        this.natsPassword = natsPassword;
    }


    // notam client api

    @SuppressWarnings("unchecked")
    @Override
    public List<ExtractedNotamData> queryADNotams(List<String> icaoIds) {
        try {
            return (List<ExtractedNotamData>) (Object) extractNotamsForAerodromes(icaoIds).get();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(ex);
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    public int getMaxADQueryCount() {
        return 200;
    }

    @SuppressWarnings("unchecked")
    @Override
    public List<ExtractedNotamData> queryFIRNotams(List<String> icaoIds) {
        try {
            return (List<ExtractedNotamData>) (Object) extractNotamsForFIRs(icaoIds).get();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(ex);
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    public int getMaxFIRQueryCount() {
        return 40;
    }

    // end notam client api

    public Future<List<AerodromeSearchResult>> searchAerodromes(String search) {
        return runTask(() -> {
            natsInteractor.selectAerodromeBriefing();
            natsInteractor.openAdSearch();
            natsInteractor.searchByAdName(search);
            final List<AerodromeSearchResult> results = natsInteractor.extractAdSearchData();
            stopWebDriver(); // webdriver unusable after search
            return results;
        });
    }

    public Future<List<FIRSearchResult>> searchFIRs(String search) {
        return runTask(() -> {
            natsInteractor.selectAreaBriefing();
            natsInteractor.openFirSearch();
            natsInteractor.searchByFirName(search);
            final List<FIRSearchResult> results = natsInteractor.extractFirSearchData();
            stopWebDriver(); // webdriver unusable after search
            return results;
        });
    }

    // end notam client serach api

    public Future<List<NATSNotam>> extractNotamsForFIRs(List<String> firs) {
        if (firs.size() > 40) {
            return CompletableFuture.failedFuture(new IllegalArgumentException("A maximum of 40 FIRs can be extracted at once."));
        }
        return runTask(() -> extract(firs, true));
    }

    public Future<List<NATSNotam>> extractNotamsForAerodromes(List<String> aerodromes) {
        if (aerodromes.size() > 200) {
            return CompletableFuture.failedFuture(new IllegalArgumentException("A maximum of 200 airports can be extracted at once."));
        }
        return runTask(() -> extract(aerodromes, false));
    }

    private List<NATSNotam> extract(List<String> icaos, boolean firExtraction) {
        if (firExtraction) {
            natsInteractor.selectAreaBriefing();
        } else {
            natsInteractor.selectAerodromeBriefing();
        }

        natsInteractor.setOptions(Map.of(
                "Save settings", false,
                "NOTAM", true,
                "SNOWTAM", true,
                "ASHTAM", true,
                "BIRDTAM", true,
                "METEO", true,
                "Charts", false,
                "Include QLine", true,
                "Mark NOTAM permanently as read", false
        ), "IFR / VFR");

        natsInteractor.setLowerFl("000");
        natsInteractor.setUpperFl("999");

        final ZonedDateTime now = Instant.now().atZone(ZoneId.of("UTC"));
        natsInteractor.setFromDate(now);
        natsInteractor.setToDate(now.plusYears(10));

        for (String icao : icaos) {
            if (firExtraction) {
                natsInteractor.enterFIR(icao);
            } else {
                natsInteractor.enterAD(icao);
            }
            // TODO: check fail properly (valid icao id)
        }

        natsInteractor.generateBriefing();

        if (firExtraction) {
            return natsInteractor.extractFIRBriefingData();
        } else {
            return natsInteractor.extractADBriefingData();
        }
    }

    public void shutdown() {
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(2, TimeUnit.MINUTES)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
        stopWebDriver();
    }

    private <T> Future<T> runTask(Callable<T> task) {
        return executorService.submit(() -> {
            // force reinit every 20 min of inactivity (30 min is logout)
            if (lastTaskExecuted == null || Instant.now().minus(20, ChronoUnit.MINUTES).isAfter(lastTaskExecuted)) {
                initNatsInteractor(true);
            } else {
                initNatsInteractor();
            }
            lastTaskExecuted = Instant.now();

            final T t = task.call();
            scheduleCleanup();
            return t;
        });
    }

    private void initNatsInteractor() {
        initNatsInteractor(false);
    }

    private void initNatsInteractor(boolean force) {
        if (force || natsInteractor == null) {
            initWebDriver();
            natsInteractor = new NATSInteractor(webDriver);
            natsInteractor.init();
            natsInteractor.login(natsUsername, natsPassword);
        }
    }

    private void initWebDriver() {
        if (webDriver != null) {
            stopWebDriver();
        }
        webDriver = webDriverFactory.get();
    }

    private void stopWebDriver() {
        if (webDriver != null) {
            webDriver.quit();
        }
        webDriver = null;
        natsInteractor = null;
    }

    private void scheduleCleanup() {
        final boolean DEBUG_NO_CLEANUP = false;
        if (DEBUG_NO_CLEANUP) {
            return;
        }

        if (cleanupFuture != null) {
            cleanupFuture.cancel(false);
        }
        cleanupFuture = executorService.schedule(this::stopWebDriver, 10, TimeUnit.SECONDS);
    }
}
