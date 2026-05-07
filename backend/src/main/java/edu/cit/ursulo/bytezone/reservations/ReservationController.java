package edu.cit.ursulo.bytezone.reservations;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Reservation>> create(@Valid @RequestBody CreateReservationRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success(reservationService.create(request), "Reservation created successfully"),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Reservation>>> getMine() {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getMine(),
                "My reservations fetched successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Reservation>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getAll(),
                "Reservations fetched successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Reservation>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.updateStatus(id, request),
                "Reservation status updated successfully"
        ));
    }
}