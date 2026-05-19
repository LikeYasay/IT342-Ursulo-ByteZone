package edu.cit.ursulo.bytezone.stations;

import jakarta.validation.constraints.NotNull;

public class UpdateStationStatusRequest {

    @NotNull(message = "Station status is required")
    private StationStatus status;

    public StationStatus getStatus() {
        return status;
    }

    public void setStatus(StationStatus status) {
        this.status = status;
    }
}