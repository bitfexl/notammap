package com.github.bitfexl.notammap.config;

import io.smallrye.config.ConfigMapping;

@ConfigMapping(prefix = "natsead")
public interface NatsEadConfig {
    String username();

    String password();
}
