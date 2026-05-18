package edu.cit.ursulo.bytezone.admin;

import edu.cit.ursulo.bytezone.orders.SnackOrderRepository;
import edu.cit.ursulo.bytezone.payments.PaymentRepository;
import edu.cit.ursulo.bytezone.payments.PaymentStatus;
import edu.cit.ursulo.bytezone.sessions.CafeSessionRepository;
import edu.cit.ursulo.bytezone.sessions.SessionStatus;
import edu.cit.ursulo.bytezone.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminMetricsService {

    private final UserRepository userRepository;
    private final SnackOrderRepository snackOrderRepository;
    private final CafeSessionRepository cafeSessionRepository;
    private final PaymentRepository paymentRepository;

    public AdminMetricsService(UserRepository userRepository,
                               SnackOrderRepository snackOrderRepository,
                               CafeSessionRepository cafeSessionRepository,
                               PaymentRepository paymentRepository) {
        this.userRepository = userRepository;
        this.snackOrderRepository = snackOrderRepository;
        this.cafeSessionRepository = cafeSessionRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public AdminMetricsResponse getMetrics() {
        long totalUsers = userRepository.count();
        long totalOrders = snackOrderRepository.count();
        long activeSessions = cafeSessionRepository.countByStatus(SessionStatus.ACTIVE);

        long pendingPayments = paymentRepository.countByStatusIn(
                List.of(
                        PaymentStatus.INITIATED,
                        PaymentStatus.PROCESSING,
                        PaymentStatus.PENDING
                )
        );

        long paidPayments = paymentRepository.countByStatus(PaymentStatus.PAID);
        long totalPayments = paymentRepository.count();

        return new AdminMetricsResponse(
                totalUsers,
                totalOrders,
                activeSessions,
                pendingPayments,
                paidPayments,
                totalPayments
        );
    }
}