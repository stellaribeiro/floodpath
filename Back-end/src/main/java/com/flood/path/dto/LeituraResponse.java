package com.flood.path.dto;

import java.time.LocalDateTime;

public record LeituraResponse(
    Long id,
    String sensorId,
    Double nivelAgua,
    String status,
    Double distancia,
    LocalDateTime dataHora
) {}
