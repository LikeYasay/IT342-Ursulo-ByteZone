package edu.cit.ursulo.bytezone.payments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConfirmPaymentRequest {

    @NotBlank
    private String referenceNo;

    @NotNull
    private PaymentMethod method;

    public String getReferenceNo() {
        return referenceNo;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }
}