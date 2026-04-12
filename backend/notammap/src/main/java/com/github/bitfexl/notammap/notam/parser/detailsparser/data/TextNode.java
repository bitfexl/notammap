package com.github.bitfexl.notammap.notam.parser.detailsparser.data;

public record TextNode (
        String text, // is always set
        Reference reference // optional
) {}
