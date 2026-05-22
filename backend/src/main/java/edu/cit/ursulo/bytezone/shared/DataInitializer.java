package edu.cit.ursulo.bytezone.shared;

import edu.cit.ursulo.bytezone.snacks.Snack;
import edu.cit.ursulo.bytezone.snacks.SnackRepository;
import edu.cit.ursulo.bytezone.stations.Station;
import edu.cit.ursulo.bytezone.stations.StationRepository;
import edu.cit.ursulo.bytezone.stations.StationStatus;
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
                snackRepository.save(new Snack(
                        "Combo Burger Meal",
                        new BigDecimal("129.00"),
                        true,
                        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                        "Recommended Offers"
                ));

                snackRepository.save(new Snack(
                        "Gamer Fries Bundle",
                        new BigDecimal("95.00"),
                        true,
                        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
                        "Recommended Offers"
                ));

                snackRepository.save(new Snack(
                        "Hotdog Sandwich",
                        new BigDecimal("55.00"),
                        true,
                        "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=600",
                        "Recommended Offers"
                ));

                snackRepository.save(new Snack(
                        "Chicken Ramen Bowl",
                        new BigDecimal("120.00"),
                        true,
                        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",
                        "Noodles & Soups"
                ));

                snackRepository.save(new Snack(
                        "Beef Noodle Soup",
                        new BigDecimal("135.00"),
                        true,
                        "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600",
                        "Noodles & Soups"
                ));

                snackRepository.save(new Snack(
                        "Creamy Mushroom Soup",
                        new BigDecimal("85.00"),
                        true,
                        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
                        "Noodles & Soups"
                ));

                snackRepository.save(new Snack(
                        "Iced Coffee",
                        new BigDecimal("75.00"),
                        true,
                        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
                        "Drinks & Beverages"
                ));

                snackRepository.save(new Snack(
                        "Blue Lemonade",
                        new BigDecimal("65.00"),
                        true,
                        "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600",
                        "Drinks & Beverages"
                ));

                snackRepository.save(new Snack(
                        "Milk Tea Classic",
                        new BigDecimal("80.00"),
                        true,
                        "https://images.unsplash.com/photo-1558857563-b371033873b8?w=600",
                        "Drinks & Beverages"
                ));
            }
        };
    }
}