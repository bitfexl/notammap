package com.github.bitfexl.notammap;

import com.github.bitfexl.notammap.notam.TestExtractor;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/hello")
public class GreetingResource {

    @Inject
    TestExtractor testExtractor;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Hello from Quarkus REST";
    }

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/testextractor")
    public String testExtractor() {
        return testExtractor.getConfig();
    }
}
