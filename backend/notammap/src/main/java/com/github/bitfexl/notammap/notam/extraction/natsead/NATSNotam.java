package com.github.bitfexl.notammap.notam.extraction.natsead;

import com.github.bitfexl.notammap.notam.extraction.ExtractedNotamData;

public record NATSNotam(Type type, String notamId, String notam, String heading) implements ExtractedNotamData {
    public enum Type {
        AERODROME,
        FIR
    }

    @Override
    public String toString() {
        // TODO: check this for correctness
        return notamId + "\n" + notam;
    }
}
