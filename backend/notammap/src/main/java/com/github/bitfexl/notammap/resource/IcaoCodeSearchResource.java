package com.github.bitfexl.notammap.resource;

import com.github.bitfexl.notammap.service.IcaoCodeLookupService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/icaosearch")
public class IcaoCodeSearchResource {
    @Inject
    IcaoCodeLookupService icaoCodeLookupService;

    @GET
    @Path("/seearch/ad/{search}")
    public Uni<IcaoCodeLookupService.SearchResult> searchAds(String search) {
        return icaoCodeLookupService.searchAerodromes(search);
    }

    @GET
    @Path("/seearch/fir/{search}")
    public Uni<IcaoCodeLookupService.SearchResult> searchFirs(String search) {
        return icaoCodeLookupService.searchFirs(search);
    }
}
