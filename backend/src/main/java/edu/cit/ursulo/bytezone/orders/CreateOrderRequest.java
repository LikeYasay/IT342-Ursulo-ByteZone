package edu.cit.ursulo.bytezone.orders;

import edu.cit.ursulo.bytezone.payments.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateOrderRequest {

    @NotNull
    private Long stationId;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    @NotNull
    private PaymentMethod paymentMethod;

    public Long getStationId() {
        return stationId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setStationId(Long stationId) {
        this.stationId = stationId;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}