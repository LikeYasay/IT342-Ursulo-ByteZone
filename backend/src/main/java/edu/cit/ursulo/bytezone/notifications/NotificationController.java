package edu.cit.ursulo.bytezone.notifications;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getMine(),
                "Notifications fetched successfully"
        ));
    }

    @GetMapping("/me/unread-count")
    public ResponseEntity<ApiResponse<Long>> getMyUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.countUnreadMine(),
                "Unread notification count fetched successfully"
        ));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.markAsRead(notificationId),
                "Notification marked as read"
        ));
    }
}