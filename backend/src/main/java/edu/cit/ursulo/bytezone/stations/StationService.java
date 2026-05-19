package edu.cit.ursulo.bytezone.stations;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StationService {

    private final StationRepository stationRepository;

    public StationService(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @Transactional(readOnly = true)
    public List<Station> getAll() {
        return stationRepository.findAll();
    }

    @Transactional
    public Station updateStatus(Long stationId, UpdateStationStatusRequest request) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));

        station.setStatus(request.getStatus());

        return stationRepository.save(station);
    }
}