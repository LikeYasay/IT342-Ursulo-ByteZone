package edu.cit.ursulo.bytezone.service;

import edu.cit.ursulo.bytezone.dto.request.CreateOrderRequest;
import edu.cit.ursulo.bytezone.dto.request.OrderItemRequest;
import edu.cit.ursulo.bytezone.dto.request.UpdateOrderStatusRequest;
import edu.cit.ursulo.bytezone.entity.*;
import edu.cit.ursulo.bytezone.repository.PaymentRepository;
import edu.cit.ursulo.bytezone.repository.SnackOrderRepository;
import edu.cit.ursulo.bytezone.repository.SnackRepository;
import edu.cit.ursulo.bytezone.repository.StationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final SnackOrderRepository snackOrderRepository;
    private final SnackRepository snackRepository;
    private final StationRepository stationRepository;
    private final PaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;

    public OrderService(SnackOrderRepository snackOrderRepository,
                        SnackRepository snackRepository,
                        StationRepository stationRepository,
                        PaymentRepository paymentRepository,
                        CurrentUserService currentUserService) {
        this.snackOrderRepository = snackOrderRepository;
        this.snackRepository = snackRepository;
        this.stationRepository = stationRepository;
        this.paymentRepository = paymentRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public SnackOrder create(CreateOrderRequest request) {
        User user = currentUserService.getCurrentUser();

        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));

        SnackOrder order = new SnackOrder();
        order.setUser(user);
        order.setStation(station);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Snack snack = snackRepository.findById(itemRequest.getSnackId())
                    .orElseThrow(() -> new RuntimeException("Snack not found"));

            if (!Boolean.TRUE.equals(snack.getAvailable())) {
                throw new RuntimeException("Snack " + snack.getName() + " is unavailable");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setSnack(snack);
            orderItem.setQuantity(itemRequest.getQty());
            orderItem.setPrice(snack.getPrice());

            orderItems.add(orderItem);
            total = total.add(snack.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQty())));
        }

        order.setTotal(total);
        order.setItems(orderItems);

        SnackOrder saved = snackOrderRepository.save(order);

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setType(PaymentType.SNACK_ORDER);
        payment.setReferenceId(saved.getId());
        payment.setAmount(saved.getTotal());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setMethod(request.getPaymentMethod());
        paymentRepository.save(payment);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<SnackOrder> getMine() {
        User user = currentUserService.getCurrentUser();
        return snackOrderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public List<SnackOrder> getAll() {
        return snackOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SnackOrder updateStatus(Long id, UpdateOrderStatusRequest request) {
        SnackOrder order = snackOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(request.getStatus());
        return snackOrderRepository.save(order);
    }
}