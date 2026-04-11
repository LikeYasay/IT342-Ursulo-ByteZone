package edu.cit.ursulo.bytezone.repository;

import edu.cit.ursulo.bytezone.entity.Snack;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SnackRepository extends JpaRepository<Snack, Long> {
}