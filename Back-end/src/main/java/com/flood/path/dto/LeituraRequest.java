package com.flood.path.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record LeituraRequest(
    @NotNull String sensorId,
    @NotNull Double nivelAgua,
    Double distancia,
    LocalDateTime dataHora
) {}
