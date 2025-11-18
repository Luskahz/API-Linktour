package com.linktour.model.usuario;

import jakarta.persistence.*;

@Entity
@Table(name = "linktour")
public class Linktour extends Usuario {

    private int registro;

    public Linktour() {}

    public int getRegistro() {
        return registro;
    }

    public void setRegistro(int registro) {
        this.registro = registro;
    }
}
