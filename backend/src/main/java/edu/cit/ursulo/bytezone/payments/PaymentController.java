package edu.cit.ursulo.bytezone.payments;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
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

    @PutMapping("/{paymentId}/sandbox/process")
    public ResponseEntity<ApiResponse<Payment>> startSandboxProcessing(
            @PathVariable Long paymentId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.startSandboxProcessing(paymentId),
                "Sandbox payment processing started"
        ));
    }

    @PutMapping("/{paymentId}/sandbox/result")
    public ResponseEntity<ApiResponse<Payment>> applySandboxResult(
            @PathVariable Long paymentId,
            @Valid @RequestBody SandboxPaymentResultRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.applySandboxResult(paymentId, request),
                "Sandbox payment result recorded successfully"
        ));
    }
}