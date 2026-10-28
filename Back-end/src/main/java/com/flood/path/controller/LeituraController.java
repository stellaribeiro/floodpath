package com.flood.path.controller;

import com.flood.path.dto.LeituraRequest;
import com.flood.path.dto.LeituraResponse;
import com.flood.path.entity.Leitura;
import com.flood.path.service.LeituraService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rios")
@CrossOrigin(origins = "*")
public class LeituraController {

    private final LeituraService service;

    //Lista thread-safe para manter os clientes/navegadores conectados em tempo real
    private final List<SseEmitter> emissores = new CopyOnWriteArrayList<>();

    public LeituraController(LeituraService service) {
        this.service = service;
    }

    // CORREÇÃO: Adicionado o parâmetro opcional 'sensorId' na URL
    @GetMapping
    public List<LeituraResponse> listar(
            @RequestParam(required = false) String sensorId,
            @RequestParam(defaultValue = "50") int limite) {

        List<Leitura> leituras;

        // Se o usuário informar o sensor na URL, filtra por ele. Caso contrário, traz todos.
        if (sensorId != null && !sensorId.isBlank()) {
            leituras = service.listarRecentesPorSensor(sensorId, limite);
        } else {
            leituras = service.listarRecentes(limite);
        }

        return leituras.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/leitura")
    public LeituraResponse receber(@Valid @RequestBody LeituraRequest request) {
        Leitura leitura = new Leitura();
        leitura.setSensorId(request.sensorId());
        leitura.setNivelAgua(request.nivelAgua());
        leitura.setDistancia(request.distancia());
        // CORREÇÃO DO TEMPO: Para simulações em tempo real, ignore a data estática do JSON
        // ou remova o campo 'dataHora' do payload enviado pelo seu script/Postman.
        leitura.setDataHora(request.dataHora() != null ? request.dataHora() : java.time.LocalDateTime.now());

        Leitura saved = service.receberLeitura(leitura);

        //Disparo em tempo real: Notifica todos os navegadore conectados assim que o dado é salvo
        notificarClientesEmTempoReal(toResponse(saved));

        return toResponse(saved);
    }

    // NOVO ENDPOINT: O Frontend se conecta aqui para ouvir novos eventos do servidor
    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter conectarStream() {
        SseEmitter emitter = new SseEmitter(0L); // Sem timeout de desconexão

        emissores.add(emitter);

        emitter.onCompletion(() -> emissores.remove(emitter));
        emitter.onTimeout(() -> emissores.remove(emitter));
        emitter.onError((e) -> emissores.remove(emitter));

        return emitter;
    }

    private void notificarClientesEmTempoReal(LeituraResponse response) {
        for (SseEmitter emitter : emissores) {
            try {
                emitter.send(SseEmitter.event()
                        .name("nova-leitura")
                        .data(response));
            } catch (IOException e) {
                emissores.remove(emitter);
            }
        }
    }

    private LeituraResponse toResponse(Leitura leitura) {
        return new LeituraResponse(
                leitura.getId(),
                leitura.getSensorId(),
                leitura.getNivelAgua(),
                leitura.getStatus(),
                leitura.getDistancia(),
                leitura.getDataHora()
        );
    }
}
