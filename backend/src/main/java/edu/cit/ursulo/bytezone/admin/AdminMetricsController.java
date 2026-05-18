package edu.cit.ursulo.bytezone.admin;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminMetricsController {

    private final AdminMetricsService adminMetricsService;

    public AdminMetricsController(AdminMetricsService adminMetricsService) {
        this.adminMetricsService = adminMetricsService;
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<AdminMetricsResponse>> getMetrics() {
        return ResponseEntity.ok(ApiResponse.success(
                adminMetricsService.getMetrics(),
                "Admin metrics fetched successfully"
        ));
    }
}