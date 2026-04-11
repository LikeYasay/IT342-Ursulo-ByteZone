package edu.cit.ursulo.bytezone.controller;

import edu.cit.ursulo.bytezone.dto.request.ConfirmPaymentRequest;
import edu.cit.ursulo.bytezone.dto.response.ApiResponse;
import edu.cit.ursulo.bytezone.entity.Payment;
import edu.cit.ursulo.bytezone.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Payment>>> getMyPayments() {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getMine(),
                "My payments fetched successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<Payment>>> getPendingPayments() {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getPending(),
                "Pending payments fetched successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Payment>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getAll(),
                "Payments fetched successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @PutMapping("/{paymentId}/confirm")
    public ResponseEntity<ApiResponse<Payment>> confirmPayment(
            @PathVariable Long paymentId,
            @Valid @RequestBody ConfirmPaymentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.confirm(paymentId, request),
                "Payment confirmed successfully"
        ));
    }
}