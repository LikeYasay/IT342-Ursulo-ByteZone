package edu.cit.ursulo.bytezone.notifications;

import edu.cit.ursulo.bytezone.auth.CurrentUserService;
import edu.cit.ursulo.bytezone.users.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    public NotificationService(NotificationRepository notificationRepository,
                               CurrentUserService currentUserService) {
        this.notificationRepository = notificationRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public Notification create(User user, String title, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getMine() {
        Long userId = currentUserService.getCurrentUser().getId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long countUnreadMine() {
        Long userId = currentUserService.getCurrentUser().getId();
        return notificationRepository.countByUserIdAndReadStatusFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setReadStatus(true);
        return notificationRepository.save(notification);
    }
}