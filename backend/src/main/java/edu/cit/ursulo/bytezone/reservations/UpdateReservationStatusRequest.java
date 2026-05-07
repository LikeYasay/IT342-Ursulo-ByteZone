package edu.cit.ursulo.bytezone.reservations;

import jakarta.validation.constraints.NotNull;

public class UpdateReservationStatusRequest {

    @NotNull
    private ReservationStatus status;

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }
}