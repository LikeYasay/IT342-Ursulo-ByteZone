package edu.cit.ursulo.bytezone.payments;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

    List<Payment> findAllByOrderByCreatedAtDesc();
}