package com.github.bitfexl.notammap.resource;

import com.github.bitfexl.notammap.service.TestService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/test")
public class TestResource {
    @Inject
    TestService testService;

    @Path("/createnotam")
    @GET
    public void createNotam() {
        testService.createNotam();
    }
}
