package com.github.bitfexl.notammap.resource;

import com.github.bitfexl.notammap.service.ExtractionService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/extract")
public class ExtractionResource {
    @Inject
    ExtractionService extractionService;

    @GET
    @Path("/{icaoIds}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> extract(String icaoIds) {
        final String[] icaoIdArray = icaoIds.split(",");
        return extractionService.extractFaaNotams(icaoIdArray);
    }
}
