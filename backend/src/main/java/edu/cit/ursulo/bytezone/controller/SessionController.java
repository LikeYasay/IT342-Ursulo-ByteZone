package edu.cit.ursulo.bytezone.controller;

import edu.cit.ursulo.bytezone.dto.request.StartSessionRequest;
import edu.cit.ursulo.bytezone.dto.response.ApiResponse;
import edu.cit.ursulo.bytezone.entity.CafeSession;
import edu.cit.ursulo.bytezone.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
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
}