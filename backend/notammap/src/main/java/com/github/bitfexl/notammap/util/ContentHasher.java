package com.github.bitfexl.notammap.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;
import java.util.Objects;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 * Builds a stable, canonical content hash over a set of named fields.
 *
 * Guarantees:
 *  - null and "" produce different hashes
 *  - field values cannot "bleed" into each other (length-prefixed encoding)
 *  - field order at call site is irrelevant (names are sorted)
 *  - renaming a field changes the hash (names are part of the input)
 *  - the schema tag separates types and lets you version the format
 */
public final class ContentHasher {

    private static final byte TAG_NULL   = 0x00;
    private static final byte TAG_STRING = 0x01;
    private static final byte TAG_BYTES  = 0x02;

    private final String schema;
    private final SortedMap<String, Object> fields = new TreeMap<>();

    /**
     * @param schema identifies what is being hashed, e.g. "com.example.Person/v1".
     *               Bump the version whenever the field set changes meaning.
     */
    public ContentHasher(String schema) {
        this.schema = Objects.requireNonNull(schema, "schema");
    }

    /** Adds a nullable string field. */
    public ContentHasher put(String name, String value) {
        return putInternal(name, value);
    }

    /** Adds a nullable raw-bytes field (e.g. a nested object's own hash). */
    public ContentHasher put(String name, byte[] value) {
        return putInternal(name, value == null ? null : value.clone());
    }

    private ContentHasher putInternal(String name, Object value) {
        Objects.requireNonNull(name, "name");
        if (fields.containsKey(name)) {
            throw new IllegalArgumentException("duplicate field: " + name);
        }
        fields.put(name, value);
        return this;
    }

    public byte[] hash() {
        MessageDigest md = newDigest();
        writeString(md, schema);
        writeInt(md, fields.size());
        for (Map.Entry<String, Object> e : fields.entrySet()) {
            writeString(md, e.getKey());
            writeValue(md, e.getValue());
        }
        return md.digest();
    }

    public String hashHex() {
        return HexFormat.of().formatHex(hash());
    }

    @Override
    public String toString() {
        return hashHex();
    }

    // --- encoding -----------------------------------------------------------

    private static void writeValue(MessageDigest md, Object value) {
        if (value == null) {
            md.update(TAG_NULL);
        } else if (value instanceof String s) {
            md.update(TAG_STRING);
            writeString(md, s);
        } else if (value instanceof byte[] b) {
            md.update(TAG_BYTES);
            writeInt(md, b.length);
            md.update(b);
        } else {
            throw new IllegalStateException("unsupported type: " + value.getClass());
        }
    }

    private static void writeString(MessageDigest md, String s) {
        byte[] b = s.getBytes(StandardCharsets.UTF_8);
        writeInt(md, b.length);
        md.update(b);
    }

    private static void writeInt(MessageDigest md, int v) {
        md.update(new byte[] {
                (byte) (v >>> 24), (byte) (v >>> 16), (byte) (v >>> 8), (byte) v
        });
    }

    private static MessageDigest newDigest() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 must be available", e);
        }
    }
}
