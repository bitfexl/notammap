package com.github.bitfexl.notammap.repository.entities;

import com.github.bitfexl.notammap.repository.entities.types.IdentifierType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ICAOIdentifier extends BaseEntity {
    /**
     * The id of the location/fir, this is most likely the icao id, but can be different if the
     * location does not have an icao id (for example some airports).
     */
    @Id
    String id;

    /**
     * Location type.
     */
    IdentifierType type;

    /**
     * Aerodrome type (provided by source) if the location is an aerodrome.
     */
    String aerodromeType;

    /**
     * Iata code, only for international airports.
     */
    String iataCode;

    /**
     * The fir, only set if the type is aerodrome, for fir types, the fir = id.
     */
    String fir;

    /**
     * Name of the location.
     */
    String name;

    /**
     * The first search in which this identifier was found.
     */
    @ManyToOne
    ICAOIdentifierSearch firstSearch;

    /**
     * The last (latest) search in which this identifier was found/updated.
     */
    @ManyToOne
    ICAOIdentifierSearch lastSearch;

    // TODO: position if possible
}
