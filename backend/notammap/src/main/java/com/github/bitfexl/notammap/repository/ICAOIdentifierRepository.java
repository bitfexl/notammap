package com.github.bitfexl.notammap.repository;

import com.github.bitfexl.notammap.repository.entities.ICAOIdentifier;
import com.github.bitfexl.notammap.repository.entities.types.IdentifierType;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class ICAOIdentifierRepository implements PanacheRepositoryBase<ICAOIdentifier, String> {
    @SuppressWarnings("unchecked")
    public List<String> getFIRIdentifiers(List<String> identifiers) {
        return getEntityManager()
                .createQuery("SELECT id FROM ICAOIdentifier WHERE type = :type AND id IN :identifiers")
                .setParameter("type", IdentifierType.FIR)
                .setParameter("identifiers", identifiers)
                .getResultList();
    }
}
