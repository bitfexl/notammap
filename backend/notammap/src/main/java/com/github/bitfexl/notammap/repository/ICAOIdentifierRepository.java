package com.github.bitfexl.notammap.repository;

import com.github.bitfexl.notammap.repository.entities.ICAOIdentifier;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ICAOIdentifierRepository implements PanacheRepositoryBase<ICAOIdentifier, String> {
}
