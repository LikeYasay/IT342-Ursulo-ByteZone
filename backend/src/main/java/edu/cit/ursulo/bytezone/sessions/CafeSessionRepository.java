package edu.cit.ursulo.bytezone.sessions;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CafeSessionRepository extends JpaRepository<CafeSession, Long> {

    Optional<CafeSession> findByUserIdAndStatus(Long userId, SessionStatus status);

    Optional<CafeSession> findByStationIdAndStatus(Long stationId, SessionStatus status);

    List<CafeSession> findByStatusOrderByCreatedAtDesc(SessionStatus status);

    long countByStatus(SessionStatus status);

    List<CafeSession> findByUserIdOrderByStartTimeDesc(Long userId);

    Optional<CafeSession> findTopByUserIdOrderByStartTimeDesc(Long userId);
}