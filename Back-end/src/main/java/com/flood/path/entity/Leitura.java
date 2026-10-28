package com.flood.path.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
public class Leitura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String sensorId;

    @NotNull
    private Double nivelAgua;

    private String status;

    private Double distancia;

    @NotNull
    private LocalDateTime dataHora;

    public Leitura(){}

    public Leitura(Long id, String sensorId, Double nivelAgua, String status, Double distancia, LocalDateTime dataHora) {
        this.id = id;
        this.sensorId = sensorId;
        this.nivelAgua = nivelAgua;
        this.status = status;
        this.distancia = distancia;
        this.dataHora = dataHora;
    }

    // novo medoto 11/09
    @Override
    public String toString() {
        return "Leitura{" +
                "id=" + id +
                ", sensorId='" + sensorId + '\'' +
                ", nivelAgua=" + nivelAgua +
                ", status='" + status + '\'' +
                ", distancia=" + distancia +
                ", dataHora=" + dataHora +
                '}';
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSensorId() {
        return sensorId;
    }

    public void setSensorId(String sensorId) {
        this.sensorId = sensorId;
    }

    public Double getNivelAgua() {
        return nivelAgua;
    }

    public void setNivelAgua(Double nivelAgua) {
        this.nivelAgua = nivelAgua;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getDistancia() {
        return distancia;
    }

    public void setDistancia(Double distancia) {
        this.distancia = distancia;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
