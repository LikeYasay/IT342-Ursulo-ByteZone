package edu.cit.ursulo.bytezone.config;

import edu.cit.ursulo.bytezone.entity.Snack;
import edu.cit.ursulo.bytezone.entity.Station;
import edu.cit.ursulo.bytezone.entity.StationStatus;
import edu.cit.ursulo.bytezone.repository.SnackRepository;
import edu.cit.ursulo.bytezone.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(StationRepository stationRepository,
                               SnackRepository snackRepository) {
        return args -> {
            if (stationRepository.count() == 0) {
                List<Station> stations = new ArrayList<>();
                for (int i = 1; i <= 20; i++) {
                    stations.add(new Station(String.format("PC-%02d", i), StationStatus.AVAILABLE));
                }
                stationRepository.saveAll(stations);
            }

            if (snackRepository.count() == 0) {
                snackRepository.save(new Snack("Chips", new BigDecimal("25.00"), true));
                snackRepository.save(new Snack("Burger", new BigDecimal("85.00"), true));
                snackRepository.save(new Snack("Ramen", new BigDecimal("120.00"), true));
                snackRepository.save(new Snack("Milk Tea", new BigDecimal("70.00"), true));
                snackRepository.save(new Snack("Hotdog Sandwich", new BigDecimal("55.00"), true));
            }
        };
    }
}