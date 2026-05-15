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
public class ICAOIdentifierSearch extends BaseEntity {
    /**
     * Primary key.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;

    @Column(nullable = false, updatable = false)
    String searchString;

    @Column(nullable = false, updatable = false)
    IdentifierType searchType;

    String source;

    int foundIdentifiers;

    /**
     * Identifiers which were previously not in the database.
     */
    int newIdentifiers;
}
