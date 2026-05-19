package edu.cit.ursulo.bytezone.stations;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping("/stations")
    public ResponseEntity<ApiResponse<List<Station>>> getStations() {
        return ResponseEntity.ok(ApiResponse.success(
                stationService.getAll(),
                "Stations fetched successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @PutMapping("/admin/stations/{stationId}/status")
    public ResponseEntity<ApiResponse<Station>> updateStationStatus(
            @PathVariable Long stationId,
            @Valid @RequestBody UpdateStationStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                stationService.updateStatus(stationId, request),
                "Station status updated successfully"
        ));
    }
}