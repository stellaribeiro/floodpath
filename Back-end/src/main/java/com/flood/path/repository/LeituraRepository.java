package com.flood.path.repository;
import com.flood.path.entity.Leitura; // ajuste para o seu pacote correto


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeituraRepository extends JpaRepository<Leitura, Long> {

    // Este método vai filtrar pelo sensor escolhido e aplicar a paginação/ordenação automaticamente
    Page<Leitura> findBySensorId(String sensorId, Pageable pageable);
}

