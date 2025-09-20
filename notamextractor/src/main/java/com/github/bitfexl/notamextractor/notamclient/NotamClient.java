package com.github.bitfexl.notamextractor.notamclient;

import java.util.List;

public interface NotamClient {
    List<String> queryNotmas(List<String> locations);
}
