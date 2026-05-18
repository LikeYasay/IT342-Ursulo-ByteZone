package edu.cit.ursulo.bytezone.announcements;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping("/api/announcements")
    public ResponseEntity<ApiResponse<List<Announcement>>> getAnnouncements() {
        return ResponseEntity.ok(ApiResponse.success(
                announcementService.getAll(),
                "Announcements fetched successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @PostMapping("/api/admin/announcements")
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request
    ) {
        return new ResponseEntity<>(
                ApiResponse.success(
                        announcementService.create(request),
                        "Announcement created successfully"
                ),
                HttpStatus.CREATED
        );
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @PutMapping("/api/admin/announcements/{announcementId}")
    public ResponseEntity<ApiResponse<Announcement>> updateAnnouncement(
            @PathVariable Long announcementId,
            @Valid @RequestBody AnnouncementRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                announcementService.update(announcementId, request),
                "Announcement updated successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @DeleteMapping("/api/admin/announcements/{announcementId}")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long announcementId) {
        announcementService.delete(announcementId);

        return ResponseEntity.ok(ApiResponse.success(
                null,
                "Announcement deleted successfully"
        ));
    }
}