package edu.cit.ursulo.bytezone.sessions;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ExtendSessionRequest {

    @NotNull(message = "Extension minutes is required")
    @Min(value = 1, message = "Extension minutes must be at least 1")
    private Integer minutes;

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    private BigDecimal amount;

    public Integer getMinutes() {
        return minutes;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setMinutes(Integer minutes) {
        this.minutes = minutes;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}