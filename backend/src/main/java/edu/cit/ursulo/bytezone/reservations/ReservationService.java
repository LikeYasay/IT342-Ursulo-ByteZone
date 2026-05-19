package edu.cit.ursulo.bytezone.reservations;

import edu.cit.ursulo.bytezone.auth.CurrentUserService;
import edu.cit.ursulo.bytezone.notifications.NotificationService;
import edu.cit.ursulo.bytezone.notifications.NotificationType;
import edu.cit.ursulo.bytezone.sessions.CafeSession;
import edu.cit.ursulo.bytezone.sessions.CafeSessionRepository;
import edu.cit.ursulo.bytezone.sessions.SessionStatus;
import edu.cit.ursulo.bytezone.stations.Station;
import edu.cit.ursulo.bytezone.stations.StationRepository;
import edu.cit.ursulo.bytezone.stations.StationStatus;
import edu.cit.ursulo.bytezone.users.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final StationRepository stationRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final CafeSessionRepository cafeSessionRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              StationRepository stationRepository,
                              CurrentUserService currentUserService,
                              NotificationService notificationService,
                              CafeSessionRepository cafeSessionRepository) {
        this.reservationRepository = reservationRepository;
        this.stationRepository = stationRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
        this.cafeSessionRepository = cafeSessionRepository;
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

        ReservationStatus newStatus = request.getStatus();

        if (newStatus == ReservationStatus.CHECKED_IN) {
            checkInReservation(reservation);
        }

        reservation.setStatus(newStatus);
        Reservation saved = reservationRepository.save(reservation);

        notificationService.create(
                saved.getUser(),
                "Reservation Status Updated",
                "Your reservation #" + saved.getId() + " is now " + saved.getStatus() + ".",
                NotificationType.RESERVATION_UPDATE
        );

        return saved;
    }

    private void checkInReservation(Reservation reservation) {
        Station station = reservation.getStation();

        if (station.getStatus() != StationStatus.AVAILABLE
                && station.getStatus() != StationStatus.RESERVED) {
            throw new RuntimeException("Station is not available for check-in");
        }

        cafeSessionRepository.findByStationIdAndStatus(station.getId(), SessionStatus.ACTIVE)
                .ifPresent(session -> {
                    throw new RuntimeException("There is already an active session on this station");
                });

        cafeSessionRepository.findByUserIdAndStatus(reservation.getUser().getId(), SessionStatus.ACTIVE)
                .ifPresent(session -> {
                    throw new RuntimeException("User already has an active session");
                });

        CafeSession session = new CafeSession();
        session.setUser(reservation.getUser());
        session.setStation(station);
        session.setStartTime(LocalDateTime.now());
        session.setEndTime(LocalDateTime.now().plusMinutes(reservation.getDurationMinutes()));
        session.setStatus(SessionStatus.ACTIVE);

        station.setStatus(StationStatus.IN_USE);
        stationRepository.save(station);

        cafeSessionRepository.save(session);
    }
}