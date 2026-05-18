package edu.cit.ursulo.bytezone.payments;

import edu.cit.ursulo.bytezone.auth.CurrentUserService;
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
        return paymentRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(
                        PaymentStatus.INITIATED,
                        PaymentStatus.PROCESSING,
                        PaymentStatus.PENDING
                )
        );
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

    @Transactional
    public Payment startSandboxProcessing(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Payment is already paid");
        }

        if (payment.getStatus() == PaymentStatus.CANCELLED || payment.getStatus() == PaymentStatus.FAILED) {
            throw new RuntimeException("Payment can no longer be processed");
        }

        payment.setMethod(PaymentMethod.SANDBOX);
        payment.setStatus(PaymentStatus.PROCESSING);

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment applySandboxResult(Long paymentId, SandboxPaymentResultRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Payment is already paid");
        }

        PaymentStatus resultStatus = request.getStatus();

        if (
                resultStatus != PaymentStatus.PAID &&
                resultStatus != PaymentStatus.FAILED &&
                resultStatus != PaymentStatus.CANCELLED
        ) {
            throw new RuntimeException("Sandbox result must be PAID, FAILED, or CANCELLED");
        }

        payment.setMethod(PaymentMethod.SANDBOX);
        payment.setStatus(resultStatus);

        if (request.getReferenceNo() != null && !request.getReferenceNo().isBlank()) {
            payment.setReferenceNo(request.getReferenceNo());
        } else {
            payment.setReferenceNo("BZ-SANDBOX-" + payment.getId());
        }

        if (resultStatus == PaymentStatus.PAID) {
            payment.setPaidAt(LocalDateTime.now());
        }

        return paymentRepository.save(payment);
    }
}