package com.github.bitfexl.notammap.notam.extraction;

import lombok.Value;

@Value
public class ExtractedNotamDataString implements ExtractedNotamData {
    String notam;

    @Override
    public String toString() {
        return notam;
    }
}
