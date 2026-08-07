package com.flood.path.servise;

import com.flood.path.entity.Rio;
import com.flood.path.repository.RioRepository;
import org.springframework.stereotype.Service;

@Service
public class RioServise {

    private final RioRepository repository;

    private static final double LIMITE_ATENCAO = 10.0;
    private static final double LIMITE_CRITICO = 15.0;



    public RioServise(RioRepository repository) {
        this.repository = repository;
    }

    public Rio receberLeitura(Rio rio,Long id_p1, Long id_p2, Long id_p3, double longitude) {
        double alturaEixoY = rio.getNivelAgua();
        double larguraEixoX = rio.getLongitude();
        repository.getReferenceById(id_p1);
        repository.getReferenceById(id_p2);
        repository.getReferenceById(id_p3);

        if (alturaEixoY >= LIMITE_CRITICO) {
            rio.setStatus("CRÍTICO " + "Largura: " + larguraEixoX);
        } else if (alturaEixoY >= LIMITE_ATENCAO) {
            rio.setStatus("ATENÇÃO");

        } else {
            rio.setStatus("NORMAL");
        }
        return repository.save(rio);

    }

    public java.util.List<Rio> listarTodas() {
        return repository.findAll();
    }

    public java.util.List<Rio> listarRecentes(int limite) {
        return repository.findAll()
                .stream()
                .sorted((a, b) -> b.getDataHora().compareTo(a.getDataHora()))
                .limit(limite)
                .toList();
    }
}
