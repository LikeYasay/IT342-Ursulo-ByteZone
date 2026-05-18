package edu.cit.ursulo.bytezone.snacks;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/snacks")
@PreAuthorize("hasAnyRole('STAFF','ADMIN')")
public class AdminSnackController {

    private final SnackService snackService;

    public AdminSnackController(SnackService snackService) {
        this.snackService = snackService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Snack>> createSnack(@Valid @RequestBody SnackRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success(snackService.create(request), "Snack created successfully"),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{snackId}")
    public ResponseEntity<ApiResponse<Snack>> updateSnack(
            @PathVariable Long snackId,
            @Valid @RequestBody SnackRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(snackService.update(snackId, request), "Snack updated successfully")
        );
    }

    @DeleteMapping("/{snackId}")
    public ResponseEntity<ApiResponse<Void>> deleteSnack(@PathVariable Long snackId) {
        snackService.delete(snackId);

        return ResponseEntity.ok(
                ApiResponse.success(null, "Snack deleted successfully")
        );
    }
}