package edu.cit.ursulo.bytezone.stations;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationRepository stationRepository;

    public StationController(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Station>>> getAllStations() {
        return ResponseEntity.ok(ApiResponse.success(
                stationRepository.findAll(),
                "Stations fetched successfully"
        ));
    }
}