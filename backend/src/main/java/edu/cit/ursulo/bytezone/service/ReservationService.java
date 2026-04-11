package edu.cit.ursulo.bytezone.service;

import edu.cit.ursulo.bytezone.dto.request.CreateReservationRequest;
import edu.cit.ursulo.bytezone.dto.request.UpdateReservationStatusRequest;
import edu.cit.ursulo.bytezone.entity.*;
import edu.cit.ursulo.bytezone.repository.ReservationRepository;
import edu.cit.ursulo.bytezone.repository.StationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final StationRepository stationRepository;
    private final CurrentUserService currentUserService;

    public ReservationService(ReservationRepository reservationRepository,
                              StationRepository stationRepository,
                              CurrentUserService currentUserService) {
        this.reservationRepository = reservationRepository;
        this.stationRepository = stationRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public Reservation create(CreateReservationRequest request) {
        User user = currentUserService.getCurrentUser();

        if (reservationRepository.existsByUserIdAndDate(user.getId(), request.getDate())) {
            throw new RuntimeException("Only one booking per user per day is allowed");
        }

        if (request.getDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Reservation date must be today or later");
        }

        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));

        boolean taken = reservationRepository.existsByStationIdAndDateAndStartTimeAndStatusIn(
                station.getId(),
                request.getDate(),
                request.getStartTime(),
                List.of(
                        ReservationStatus.PENDING,
                        ReservationStatus.APPROVED,
                        ReservationStatus.CHECKED_IN
                )
        );

        if (taken) {
            throw new RuntimeException("Selected station is not available for that time");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setStation(station);
        reservation.setDate(request.getDate());
        reservation.setStartTime(request.getStartTime());
        reservation.setDurationMinutes(request.getDurationMinutes());
        reservation.setStatus(ReservationStatus.PENDING);

        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getMine() {
        User user = currentUserService.getCurrentUser();
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public List<Reservation> getAll() {
        return reservationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Reservation updateStatus(Long id, UpdateReservationStatusRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus(request.getStatus());
        return reservationRepository.save(reservation);
    }
}