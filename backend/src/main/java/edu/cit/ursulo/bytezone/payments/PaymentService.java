package edu.cit.ursulo.bytezone.payments;

import edu.cit.ursulo.bytezone.auth.CurrentUserService;
import edu.cit.ursulo.bytezone.shared.EmailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.cit.ursulo.bytezone.notifications.NotificationService;
import edu.cit.ursulo.bytezone.notifications.NotificationType;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public PaymentService(PaymentRepository paymentRepository,
                      CurrentUserService currentUserService,
                      NotificationService notificationService,
                      EmailService emailService) {
    this.paymentRepository = paymentRepository;
    this.currentUserService = currentUserService;
    this.notificationService = notificationService;
    this.emailService = emailService;
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

        Payment saved = paymentRepository.save(payment);

        notificationService.create(
                saved.getUser(),
                "Payment Confirmed",
                "Your payment #" + saved.getId() + " has been confirmed.",
                NotificationType.PAYMENT_UPDATE
        );

        emailService.sendPaymentConfirmedEmail(
                saved.getUser().getEmail(),
                saved.getUser().getFullName(),
                saved.getId()
        );

        return saved;
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

        Payment saved = paymentRepository.save(payment);

        notificationService.create(
                saved.getUser(),
                "Sandbox Payment Updated",
                "Your sandbox payment #" + saved.getId() + " is now " + saved.getStatus() + ".",
                NotificationType.PAYMENT_UPDATE
        );

        // if (resultStatus == PaymentStatus.PAID) {
        //     emailService.sendPaymentConfirmedEmail(
        //             saved.getUser().getEmail(),
        //             saved.getUser().getFullName(),
        //             saved.getId()
        //     );
        // }

        return saved;
    }
}