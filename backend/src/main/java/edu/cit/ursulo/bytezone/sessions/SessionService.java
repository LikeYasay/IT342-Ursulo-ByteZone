package edu.cit.ursulo.bytezone.sessions;

import edu.cit.ursulo.bytezone.stations.Station;
import edu.cit.ursulo.bytezone.stations.StationRepository;
import edu.cit.ursulo.bytezone.stations.StationStatus;
import edu.cit.ursulo.bytezone.users.User;
import edu.cit.ursulo.bytezone.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.cit.ursulo.bytezone.payments.Payment;
import edu.cit.ursulo.bytezone.payments.PaymentMethod;
import edu.cit.ursulo.bytezone.payments.PaymentRepository;
import edu.cit.ursulo.bytezone.payments.PaymentStatus;
import edu.cit.ursulo.bytezone.payments.PaymentType;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class SessionService {

    private final CafeSessionRepository cafeSessionRepository;
    private final StationRepository stationRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

        public SessionService(CafeSessionRepository cafeSessionRepository,
                        StationRepository stationRepository,
                        UserRepository userRepository,
                        PaymentRepository paymentRepository) {
        this.cafeSessionRepository = cafeSessionRepository;
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }
    
    @Transactional(readOnly = true)
    public List<CafeSession> getActiveSessions() {
        return cafeSessionRepository.findByStatusOrderByCreatedAtDesc(SessionStatus.ACTIVE);
    }

    @Transactional
    public CafeSession start(StartSessionRequest request) {
        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));

        if (station.getStatus() != StationStatus.AVAILABLE) {
            throw new RuntimeException("Station is not available");
        }

        cafeSessionRepository.findByStationIdAndStatus(station.getId(), SessionStatus.ACTIVE)
                .ifPresent(s -> {
                    throw new RuntimeException("There is already an active session on this station");
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
        cafeSessionRepository.save(session);

        Station station = session.getStation();
        station.setStatus(StationStatus.AVAILABLE);
        stationRepository.save(station);

        return session;
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