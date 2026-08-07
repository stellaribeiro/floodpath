package com.flood.path.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rio")
public class Rio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double nivelAgua;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime dataHora = LocalDateTime.now();

    protected Rio() {}

    public Rio(Long id, Double nivelAgua, double longitude, String status, LocalDateTime dataHora) {
        this.id = id;
        this.nivelAgua = nivelAgua;
        this.longitude = longitude;
        this.status = status;
        this.dataHora = dataHora;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getNivelAgua() { return nivelAgua; }
    public void setNivelAgua(Double nivelAgua) { this.nivelAgua = nivelAgua; }

    public Double getLongitude() {return longitude;}
    public void setLongitude(Double longitude) {this.longitude = longitude;}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

}
