package edu.cit.ursulo.bytezone.orders;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SnackOrderRepository extends JpaRepository<SnackOrder, Long> {

    List<SnackOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SnackOrder> findAllByOrderByCreatedAtDesc();
}