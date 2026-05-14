package com.github.bitfexl.notammap.repository.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Notam extends BaseEntity {
    @Id
    private long id;

    private String text;
}
