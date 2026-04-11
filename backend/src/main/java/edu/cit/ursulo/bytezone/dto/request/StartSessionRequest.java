package edu.cit.ursulo.bytezone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class StartSessionRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Station ID is required")
    private Long stationId;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    public StartSessionRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public Long getStationId() {
        return stationId;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setStationId(Long stationId) {
        this.stationId = stationId;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}