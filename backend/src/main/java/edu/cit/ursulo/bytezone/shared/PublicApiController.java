package edu.cit.ursulo.bytezone.shared;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicApiController {

    private static final Logger log = LoggerFactory.getLogger(PublicApiController.class);

    private final RestTemplate restTemplate;
    private final String rawgApiKey;

    public PublicApiController(@Value("${rawg.api-key:}") String rawgApiKey) {
        this.restTemplate = new RestTemplate();
        this.rawgApiKey = rawgApiKey;
    }

    @GetMapping("/gaming-highlights")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGamingHighlights() {
        if (rawgApiKey == null || rawgApiKey.isBlank()) {
            return ResponseEntity.ok(
                    ApiResponse.success(getFallbackHighlights(), "Gaming highlights fallback data")
            );
        }

        try {
            String url = "https://api.rawg.io/api/games"
                    + "?key=" + URLEncoder.encode(rawgApiKey, StandardCharsets.UTF_8)
                    + "&page_size=8"
                    + "&ordering=-rating"
                    + "&metacritic=80,100";

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = response != null
                    ? (List<Map<String, Object>>) response.get("results")
                    : List.of();

            List<Map<String, Object>> highlights = results.stream()
                    .limit(8)
                    .map(game -> Map.<String, Object>of(
                            "name", game.getOrDefault("name", "Unknown Game"),
                            "rating", game.getOrDefault("rating", 0),
                            "released", game.getOrDefault("released", ""),
                            "background", game.getOrDefault("background_image", ""),
                            "genres", game.getOrDefault("genres", List.of())
                    ))
                    .toList();

            if (highlights.isEmpty()) {
                return ResponseEntity.ok(
                        ApiResponse.success(getFallbackHighlights(), "Gaming highlights fallback data")
                );
            }

            return ResponseEntity.ok(
                    ApiResponse.success(highlights, "Gaming highlights fetched from RAWG API")
            );
        } catch (Exception e) {
            log.warn("[PublicApi] Failed to fetch RAWG gaming highlights. Using fallback data. Reason: {}", e.getMessage());

            return ResponseEntity.ok(
                    ApiResponse.success(getFallbackHighlights(), "Gaming highlights fallback data")
            );
        }
    }

    private List<Map<String, Object>> getFallbackHighlights() {
        return List.of(
                Map.of(
                        "name", "Valorant",
                        "rating", 4.5,
                        "released", "2020-06-02",
                        "background", "https://www.riotgames.com/darkroom/1440/8d5c497da1c2eeec8cffa99b01abc64b:5329ca773963a5b739e98e715957ab39/ps-f2p-val-console-launch-16x9.jpg",
                        "genres", List.of()
                ),
                Map.of(
                        "name", "Counter-Strike 2",
                        "rating", 4.3,
                        "released", "2023-09-27",
                        "background", "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_616x353.jpg",
                        "genres", List.of()
                ),
                Map.of(
                        "name", "League of Legends",
                        "rating", 4.2,
                        "released", "2009-10-27",
                        "background", "https://static.wikia.nocookie.net/leagueoflegends/images/7/7b/League_of_Legends_Cover.jpg",
                        "genres", List.of()
                ),
                Map.of(
                        "name", "Apex Legends",
                        "rating", 4.1,
                        "released", "2019-02-04",
                        "background", "https://media.contentapi.ea.com/content/dam/apex-legends/common/apex-legends-og-image.jpg",
                        "genres", List.of()
                )
        );
    }
}