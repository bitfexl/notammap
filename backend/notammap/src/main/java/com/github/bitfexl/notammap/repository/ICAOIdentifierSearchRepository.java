package com.github.bitfexl.notammap.repository;

import com.github.bitfexl.notammap.repository.entities.ICAOIdentifierSearch;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ICAOIdentifierSearchRepository implements PanacheRepository<ICAOIdentifierSearch> {
}
