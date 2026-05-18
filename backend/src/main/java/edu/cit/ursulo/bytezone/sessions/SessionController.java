package edu.cit.ursulo.bytezone.sessions;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CafeSession>>> getActiveSessions() {
        return ResponseEntity.ok(
                ApiResponse.success(sessionService.getActiveSessions(), "Active sessions fetched successfully")
        );
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<CafeSession>> start(@Valid @RequestBody StartSessionRequest request) {
        return new ResponseEntity<>(
                ApiResponse.success(sessionService.start(request), "Session started successfully"),
                HttpStatus.CREATED
        );
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @PutMapping("/{sessionId}/end")
    public ResponseEntity<ApiResponse<CafeSession>> end(@PathVariable Long sessionId) {
        return ResponseEntity.ok(
                ApiResponse.success(sessionService.end(sessionId), "Session ended successfully")
        );
    }

        @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @PutMapping("/{sessionId}/extend")
    public ResponseEntity<ApiResponse<CafeSession>> extend(
            @PathVariable Long sessionId,
            @Valid @RequestBody ExtendSessionRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(sessionService.extend(sessionId, request), "Session extended successfully")
        );
    }
}