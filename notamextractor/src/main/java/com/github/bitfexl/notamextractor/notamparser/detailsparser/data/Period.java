package com.github.bitfexl.notamextractor.notamparser.detailsparser.data;

import java.util.Date;

public record Period (
        Date start,
        Date end,
        Integer sunriseOffset, // start is relative to sunrise (time in minutes, from only accurate to day)
        Integer sunsetOffset // same for end
) {}