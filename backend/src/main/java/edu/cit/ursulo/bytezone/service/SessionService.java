package edu.cit.ursulo.bytezone.service;

import edu.cit.ursulo.bytezone.dto.request.ExtendSessionRequest;
import edu.cit.ursulo.bytezone.dto.request.StartSessionRequest;
import edu.cit.ursulo.bytezone.entity.*;
import edu.cit.ursulo.bytezone.repository.CafeSessionRepository;
import edu.cit.ursulo.bytezone.repository.PaymentRepository;
import edu.cit.ursulo.bytezone.repository.StationRepository;
import edu.cit.ursulo.bytezone.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    public Payment extend(Long sessionId, ExtendSessionRequest request) {
        CafeSession session = cafeSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new RuntimeException("Only active sessions can be extended");
        }

        session.setEndTime(session.getEndTime().plusMinutes(request.getAddMinutes()));
        cafeSessionRepository.save(session);

        BigDecimal amount = BigDecimal.valueOf(request.getAddMinutes());

        Payment payment = new Payment();
        payment.setUser(session.getUser());
        payment.setType(PaymentType.SESSION_EXTENSION);
        payment.setReferenceId(session.getId());
        payment.setAmount(amount);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setMethod(request.getPaymentMethod());

        return paymentRepository.save(payment);
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
}