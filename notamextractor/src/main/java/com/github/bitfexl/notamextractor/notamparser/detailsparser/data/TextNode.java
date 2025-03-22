package com.github.bitfexl.notamextractor.notamparser.detailsparser.data;

public record TextNode (
        String text, // is always set
        Reference reference // optional
) {}
