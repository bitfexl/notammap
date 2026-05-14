package com.github.bitfexl.notammap.repository;

import com.github.bitfexl.notammap.repository.entities.Notam;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class NotamRepository implements PanacheRepository<Notam> {
}
