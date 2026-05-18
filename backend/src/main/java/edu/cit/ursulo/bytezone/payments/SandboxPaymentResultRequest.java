package edu.cit.ursulo.bytezone.payments;

import jakarta.validation.constraints.NotNull;

public class SandboxPaymentResultRequest {

    @NotNull(message = "Payment status is required")
    private PaymentStatus status;

    private String referenceNo;

    public PaymentStatus getStatus() {
        return status;
    }

    public String getReferenceNo() {
        return referenceNo;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }
}