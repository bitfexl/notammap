package com.github.bitfexl.notammap.resource;

import com.github.bitfexl.notammap.service.ExtractionService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;
import java.util.Objects;

@Path("/extract")
public class ExtractionResource {
    @Inject
    ExtractionService extractionService;

    @GET
    @Path("/{icaoIds}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<?> extract(String icaoIds) {
        final String[] icaoIdArray = icaoIds.split(",");
        return extractionService.extractNotams(ExtractionService.NotamSource.FAA, List.of(icaoIdArray));
    }

    @GET
    @Path("/search/aerodromes/{search}")
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<ExtractionService.SearchResult> search(String search) {
        return extractionService.searchAerodromes(search);
    }
}
