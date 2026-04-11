package edu.cit.ursulo.bytezone.repository;

import edu.cit.ursulo.bytezone.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationRepository extends JpaRepository<Station, Long> {
}