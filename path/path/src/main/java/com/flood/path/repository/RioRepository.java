package com.flood.path.repository;

import com.flood.path.entity.Rio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RioRepository extends JpaRepository<Rio, Long> {
}
