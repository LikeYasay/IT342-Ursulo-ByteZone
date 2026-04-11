package edu.cit.ursulo.bytezone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class OrderItemRequest {

    @NotNull
    private Long snackId;

    @NotNull
    @Min(1)
    private Integer qty;

    public Long getSnackId() {
        return snackId;
    }

    public Integer getQty() {
        return qty;
    }

    public void setSnackId(Long snackId) {
        this.snackId = snackId;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }
}