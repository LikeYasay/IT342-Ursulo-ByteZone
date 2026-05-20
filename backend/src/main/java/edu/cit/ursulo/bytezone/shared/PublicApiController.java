package edu.cit.ursulo.bytezone.shared;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicApiController {

    private static final Logger log = LoggerFactory.getLogger(PublicApiController.class);

    // Free public gaming API — no key required
    private static final String RAWG_URL =
            "https://api.rawg.io/api/games?key=&page_size=6&ordering=-rating&metacritic=80,100";

    private final RestTemplate restTemplate;

    public PublicApiController() {
        this.restTemplate = new RestTemplate();
    }

    @GetMapping("/gaming-highlights")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGamingHighlights() {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(RAWG_URL, Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = response != null
                    ? (List<Map<String, Object>>) response.get("results")
                    : List.of();

            // Trim to just the fields we need
            List<Map<String, Object>> highlights = results.stream()
                    .limit(6)
                    .map(game -> Map.<String, Object>of(
                            "name",       game.getOrDefault("name", "Unknown Game"),
                            "rating",     game.getOrDefault("rating", 0),
                            "released",   game.getOrDefault("released", ""),
                            "background", game.getOrDefault("background_image", ""),
                            "genres",     game.getOrDefault("genres", List.of())
                    ))
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(highlights, "Gaming highlights fetched"));
        } catch (Exception e) {
            log.warn("[PublicApi] Failed to fetch gaming highlights: {}", e.getMessage());
            return ResponseEntity.ok(ApiResponse.success(
                    List.of(), "Gaming highlights unavailable"
            ));
        }
    }
}
