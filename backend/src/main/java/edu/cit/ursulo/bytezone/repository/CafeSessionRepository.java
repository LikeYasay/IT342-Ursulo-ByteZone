package edu.cit.ursulo.bytezone.repository;

import edu.cit.ursulo.bytezone.entity.CafeSession;
import edu.cit.ursulo.bytezone.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CafeSessionRepository extends JpaRepository<CafeSession, Long> {

    Optional<CafeSession> findByStationIdAndStatus(Long stationId, SessionStatus status);

    List<CafeSession> findByStatusOrderByCreatedAtDesc(SessionStatus status);
}