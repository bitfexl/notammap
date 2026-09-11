package com.github.bitfexl.notammap.resource;

import com.github.bitfexl.notammap.service.ExtractionService;
import com.github.bitfexl.notammap.service.NotamProcessingService;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/extract")
public class ExtractionResource {
    @Inject
    ExtractionService extractionService;

    @Inject
    NotamProcessingService notamProcessingService;

    @GET
    @Path("/{source}/{icaoIds}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<?> extract(String source, String icaoIds) {
        ExtractionService.NotamSource notamSource;

        if (source.equalsIgnoreCase("FAA")) {
            notamSource = ExtractionService.NotamSource.FAA;
        } else if (source.equalsIgnoreCase("NATS")) {
            notamSource = ExtractionService.NotamSource.NATS;
        } else {
            throw new BadRequestException("Unknown source: " + source);
        }

        final String[] icaoIdArray = icaoIds.split(",");

        return extractionService.extractNotams(notamSource, List.of(icaoIdArray)).stream()
                .map(notam -> notamProcessingService.recreateRawNotam(notamSource, notam)).toList();
    }
}
