package com.github.bitfexl.notammap.repository.entities.types;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.TreeMap;

@RequiredArgsConstructor
@Getter
public enum IdentifierType {
    AERODROME('A'),
    FIR('F');

    private final int intValue;

    private static final Map<Integer, IdentifierType> reverseLookup;

    static {
        reverseLookup = new TreeMap<>();
        for (IdentifierType identifier : values()) {
            reverseLookup.put(identifier.getIntValue(), identifier);
        }
    }

    public static IdentifierType fromIntValue(int value) {
        return reverseLookup.get(value);
    }
}

@Converter(autoApply = true)
class TypeConverter implements AttributeConverter<IdentifierType, Integer> {
    @Override
    public Integer convertToDatabaseColumn(IdentifierType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getIntValue();
    }

    @Override
    public IdentifierType convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return null;
        }
        final IdentifierType type = IdentifierType.fromIntValue(dbData);
        if (type == null) {
            throw new IllegalArgumentException("Unknown ICAO identifier in database: '" + dbData + "'.");
        }
        return type;
    }
}