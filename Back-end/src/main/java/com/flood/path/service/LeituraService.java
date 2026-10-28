package com.flood.path.service;

import com.flood.path.entity.Leitura;
import com.flood.path.repository.LeituraRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeituraService {

    private final LeituraRepository repository;

    private static final double LIMITE_ATENCAO = 10.0;
    private static final double LIMITE_CRITICO = 15.0;

    public LeituraService(LeituraRepository repository) {
        this.repository = repository;
    }
    @Transactional
    public Leitura receberLeitura(Leitura leitura) {
        // CORREÇÃO DO TEMPO: Se o sensor não enviar a data/hora, ou enviar fixa,
        // nós garantimos o carimbo do momento exato em que o servidor recebeu o dado.
        if (leitura.getDataHora() == null) {
            leitura.setDataHora(LocalDateTime.now());
        }

        double nivel = leitura.getNivelAgua() != null ? leitura.getNivelAgua() : 0.0;
        if (nivel >= LIMITE_CRITICO) {
            leitura.setStatus("CRÍTICO");
        } else if (nivel >= LIMITE_ATENCAO) {
            leitura.setStatus("ATENÇÃO");
        } else {
            leitura.setStatus("NORMAL");
        }
        return repository.save(leitura);
    }

    // Método antigo (traz tudo misturado)
    public List<Leitura> listarRecentes(int limite) {
        return repository.findAll(PageRequest.of(0, limite, Sort.by(Sort.Direction.DESC, "dataHora"))).getContent();
    }

    // CORREÇÃO DO FILTRO: Novo método para trazer leituras ordenadas de APENAS UM SENSOR específico
    public List<Leitura> listarRecentesPorSensor(String sensorId, int limite) {
        // IMPORTANTE: Certifique-se de chamar o findBySensorId e NÃO o findAll
        return repository.findBySensorId(
                sensorId,
                PageRequest.of(0, limite, Sort.by(Sort.Direction.DESC, "dataHora"))
        ).getContent();
    }

}
