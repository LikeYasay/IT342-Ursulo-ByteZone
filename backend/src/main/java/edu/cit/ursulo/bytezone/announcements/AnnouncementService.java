package edu.cit.ursulo.bytezone.announcements;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @Transactional(readOnly = true)
    public List<Announcement> getAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Announcement create(AnnouncementRequest request) {
        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setDescription(request.getDescription());
        announcement.setCreatedBy(
                request.getCreatedBy() != null && !request.getCreatedBy().isBlank()
                        ? request.getCreatedBy()
                        : "ByteZone Admin"
        );

        return announcementRepository.save(announcement);
    }

    @Transactional
    public Announcement update(Long announcementId, AnnouncementRequest request) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        announcement.setTitle(request.getTitle());
        announcement.setDescription(request.getDescription());

        if (request.getCreatedBy() != null && !request.getCreatedBy().isBlank()) {
            announcement.setCreatedBy(request.getCreatedBy());
        }

        return announcementRepository.save(announcement);
    }

    @Transactional
    public void delete(Long announcementId) {
        if (!announcementRepository.existsById(announcementId)) {
            throw new RuntimeException("Announcement not found");
        }

        announcementRepository.deleteById(announcementId);
    }
}