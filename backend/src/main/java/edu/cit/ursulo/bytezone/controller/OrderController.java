package edu.cit.ursulo.bytezone.controller;

import edu.cit.ursulo.bytezone.dto.request.CreateOrderRequest;
import edu.cit.ursulo.bytezone.dto.request.UpdateOrderStatusRequest;
import edu.cit.ursulo.bytezone.dto.response.ApiResponse;
import edu.cit.ursulo.bytezone.entity.Snack;
import edu.cit.ursulo.bytezone.entity.SnackOrder;
import edu.cit.ursulo.bytezone.repository.SnackRepository;
import edu.cit.ursulo.bytezone.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class OrderController {

    private final SnackRepository snackRepository;
    private final OrderService orderService;

    public OrderController(SnackRepository snackRepository, OrderService orderService) {
        this.snackRepository = snackRepository;
        this.orderService = orderService;
    }

    @GetMapping("/api/snacks")
    public ResponseEntity<ApiResponse<List<Snack>>> getSnacks() {
        return ResponseEntity.ok(ApiResponse.success(
                snackRepository.findAll(),
                "Snacks fetched successfully"
        ));
    }

    @PostMapping("/api/orders")
    public ResponseEntity<ApiResponse<SnackOrder>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success(orderService.create(request), "Order placed successfully"),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/api/orders/me")
    public ResponseEntity<ApiResponse<List<SnackOrder>>> getMyOrders() {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getMine(),
                "My orders fetched successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/api/orders")
    public ResponseEntity<ApiResponse<List<SnackOrder>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getAll(),
                "Orders fetched successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @PutMapping("/api/orders/{id}/status")
    public ResponseEntity<ApiResponse<SnackOrder>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateStatus(id, request),
                "Order status updated successfully"
        ));
    }
}