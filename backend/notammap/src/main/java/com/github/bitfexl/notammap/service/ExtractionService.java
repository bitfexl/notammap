package com.github.bitfexl.notammap.service;

import com.github.bitfexl.notammap.notam.extraction.NOTAMClient;
import com.github.bitfexl.notammap.notam.extraction.faa.FAANotamExtractor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class ExtractionService {
    @Inject
    FAANotamExtractor faaNotamExtractor;

    public List<String> extractFaaNotams(String[] icaIds) {
        return extractNotams(faaNotamExtractor, icaIds);
    }

    private List<String> extractNotams(NOTAMClient notamClient, String[] icaIds) {
        return notamClient.queryADNotams(List.of(icaIds));
    }
}
