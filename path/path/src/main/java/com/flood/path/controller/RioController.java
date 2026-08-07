package com.flood.path.controller;

import com.flood.path.entity.Rio;
import com.flood.path.servise.RioServise;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leituras")
@CrossOrigin(origins = "*")
public class RioController {

    private final RioServise servise;

    public RioController(RioServise servise) {
        this.servise = servise;
    }

    @GetMapping
    public List<Rio> listar(@RequestParam(defaultValue = "50") int limite) {
        return servise.listarRecentes(limite);
    }

    @PostMapping
    public Rio receber(@RequestBody Rio rio, Long id_p1, Long id_p2, Long id_p3, double longitude) {
        return servise.receberLeitura(rio, id_p1 ,id_p2, id_p3, longitude);
    }
}
