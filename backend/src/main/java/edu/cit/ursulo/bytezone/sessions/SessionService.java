package edu.cit.ursulo.bytezone.sessions;

import edu.cit.ursulo.bytezone.auth.CurrentUserService;
import edu.cit.ursulo.bytezone.payments.Payment;
import edu.cit.ursulo.bytezone.payments.PaymentMethod;
import edu.cit.ursulo.bytezone.payments.PaymentRepository;
import edu.cit.ursulo.bytezone.payments.PaymentStatus;
import edu.cit.ursulo.bytezone.payments.PaymentType;
import edu.cit.ursulo.bytezone.reservations.Reservation;
import edu.cit.ursulo.bytezone.reservations.ReservationRepository;
import edu.cit.ursulo.bytezone.reservations.ReservationStatus;
import edu.cit.ursulo.bytezone.stations.Station;
import edu.cit.ursulo.bytezone.stations.StationRepository;
import edu.cit.ursulo.bytezone.stations.StationStatus;
import edu.cit.ursulo.bytezone.users.User;
import edu.cit.ursulo.bytezone.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessionService {

    private final CafeSessionRepository cafeSessionRepository;
    private final StationRepository stationRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;
    private final ReservationRepository reservationRepository;

    public SessionService(CafeSessionRepository cafeSessionRepository,
                          StationRepository stationRepository,
                          UserRepository userRepository,
                          PaymentRepository paymentRepository,
                          CurrentUserService currentUserService,
                          ReservationRepository reservationRepository) {
        this.cafeSessionRepository = cafeSessionRepository;
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.currentUserService = currentUserService;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<CafeSession> getActiveSessions() {
        return cafeSessionRepository.findByStatusOrderByCreatedAtDesc(SessionStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public CafeSession getMyActiveSession() {
        User user = currentUserService.getCurrentUser();

        return cafeSessionRepository.findByUserIdAndStatus(user.getId(), SessionStatus.ACTIVE)
                .orElse(null);
    }

    @Transactional
    public CafeSession start(StartSessionRequest request) {
        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));

        if (station.getStatus() != StationStatus.AVAILABLE) {
            throw new RuntimeException("Station is not available");
        }

        cafeSessionRepository.findByStationIdAndStatus(station.getId(), SessionStatus.ACTIVE)
                .ifPresent(session -> {
                    throw new RuntimeException("There is already an active session on this station");
                });

        cafeSessionRepository.findByUserIdAndStatus(request.getUserId(), SessionStatus.ACTIVE)
                .ifPresent(session -> {
                    throw new RuntimeException("User already has an active session");
                });

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CafeSession session = new CafeSession();
        session.setStation(station);
        session.setUser(user);
        session.setStartTime(LocalDateTime.now());
        session.setEndTime(LocalDateTime.now().plusMinutes(request.getDurationMinutes()));
        session.setStatus(SessionStatus.ACTIVE);

        station.setStatus(StationStatus.IN_USE);
        stationRepository.save(station);

        return cafeSessionRepository.save(session);
    }

    @Transactional
    public CafeSession end(Long sessionId) {
        CafeSession session = cafeSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(SessionStatus.ENDED);
        CafeSession saved = cafeSessionRepository.save(session);

        Station station = session.getStation();
        station.setStatus(StationStatus.AVAILABLE);
        stationRepository.save(station);

        reservationRepository.findFirstByUserIdAndStationIdAndStatusOrderByCreatedAtDesc(
                session.getUser().getId(),
                station.getId(),
                ReservationStatus.CHECKED_IN
        ).ifPresent(reservation -> {
            reservation.setStatus(ReservationStatus.COMPLETED);
            reservationRepository.save(reservation);
        });

        return saved;
    }

    @Transactional
    public CafeSession extend(Long sessionId, ExtendSessionRequest request) {
        CafeSession session = cafeSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new RuntimeException("Only active sessions can be extended");
        }

        session.setEndTime(session.getEndTime().plusMinutes(request.getMinutes()));
        CafeSession saved = cafeSessionRepository.save(session);

        Payment payment = new Payment();
        payment.setUser(saved.getUser());
        payment.setType(PaymentType.SESSION_EXTENSION);
        payment.setReferenceId(saved.getId());
        payment.setAmount(request.getAmount());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setMethod(PaymentMethod.SANDBOX);
        paymentRepository.save(payment);

        return saved;
    }
}