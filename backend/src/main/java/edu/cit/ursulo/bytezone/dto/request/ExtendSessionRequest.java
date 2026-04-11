package edu.cit.ursulo.bytezone.dto.request;

import edu.cit.ursulo.bytezone.entity.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ExtendSessionRequest {

    @NotNull
    @Min(30)
    private Integer addMinutes;

    @NotNull
    private PaymentMethod paymentMethod;

    public Integer getAddMinutes() {
        return addMinutes;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setAddMinutes(Integer addMinutes) {
        this.addMinutes = addMinutes;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}