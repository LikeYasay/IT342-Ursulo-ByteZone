package edu.cit.ursulo.bytezone.reservations;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Reservation> findAllByOrderByCreatedAtDesc();

    boolean existsByUserIdAndDate(Long userId, LocalDate date);

    boolean existsByStationIdAndDateAndStartTimeAndStatusIn(
            Long stationId,
            LocalDate date,
            LocalTime startTime,
            List<ReservationStatus> statuses
    );

    Optional<Reservation> findFirstByUserIdAndStationIdAndStatusOrderByCreatedAtDesc(
            Long userId,
            Long stationId,
            ReservationStatus status
    );
}