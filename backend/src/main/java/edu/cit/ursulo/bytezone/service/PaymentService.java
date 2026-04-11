package edu.cit.ursulo.bytezone.service;

import edu.cit.ursulo.bytezone.dto.request.ConfirmPaymentRequest;
import edu.cit.ursulo.bytezone.entity.Payment;
import edu.cit.ursulo.bytezone.entity.PaymentStatus;
import edu.cit.ursulo.bytezone.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;

    public PaymentService(PaymentRepository paymentRepository,
                          CurrentUserService currentUserService) {
        this.paymentRepository = paymentRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<Payment> getPending() {
        return paymentRepository.findByStatusOrderByCreatedAtDesc(PaymentStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<Payment> getMine() {
        Long userId = currentUserService.getCurrentUser().getId();
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Payment> getAll() {
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Payment confirm(Long paymentId, ConfirmPaymentRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.PAID);
        payment.setReferenceNo(request.getReferenceNo());
        payment.setMethod(request.getMethod());
        payment.setPaidAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }
}