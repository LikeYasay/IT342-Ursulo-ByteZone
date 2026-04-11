package edu.cit.ursulo.bytezone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class StartSessionRequest {

    @NotNull
    private Long stationId;

    @NotNull
    private Long userId;

    @NotNull
    @Min(30)
    private Integer durationMinutes;

    public Long getStationId() {
        return stationId;
    }

    public Long getUserId() {
        return userId;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setStationId(Long stationId) {
        this.stationId = stationId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}