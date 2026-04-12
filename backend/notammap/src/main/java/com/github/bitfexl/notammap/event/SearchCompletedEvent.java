package com.github.bitfexl.notammap.event;

import java.util.List;

public record SearchCompletedEvent(String searchString, List<String> results) {
}
