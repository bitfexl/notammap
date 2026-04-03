package com.github.bitfexl.notammap.notam.extraction.faa;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

public class InvalidIcaoIdsException extends RuntimeException {
    @Getter
    private final List<String> invalidICAOIds;

    public InvalidIcaoIdsException(List<String> invalidICAOIds) {
        super(String.join(", ", invalidICAOIds));
        this.invalidICAOIds = invalidICAOIds;
    }
}
