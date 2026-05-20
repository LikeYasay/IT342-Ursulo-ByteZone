package edu.cit.ursulo.bytezone.uploads;

import edu.cit.ursulo.bytezone.auth.CurrentUserService;
import edu.cit.ursulo.bytezone.users.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class FileUploadService {

    private final CloudinaryUploadService cloudinaryUploadService;
    private final UploadedFileRepository uploadedFileRepository;
    private final CurrentUserService currentUserService;

    public FileUploadService(CloudinaryUploadService cloudinaryUploadService,
                             UploadedFileRepository uploadedFileRepository,
                             CurrentUserService currentUserService) {
        this.cloudinaryUploadService = cloudinaryUploadService;
        this.uploadedFileRepository = uploadedFileRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public UploadedFile upload(MultipartFile file, FileRecordType recordType, Long recordId) {
        User uploader = currentUserService.getCurrentUser();

        String secureUrl = cloudinaryUploadService.uploadImage(file, "bytezone/files");

        UploadedFile record = new UploadedFile();
        record.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        record.setSecureUrl(secureUrl);
        record.setMimeType(file.getContentType());
        record.setFileSizeBytes(file.getSize());
        record.setRecordType(recordType);
        record.setRecordId(recordId);
        record.setUploadedBy(uploader);

        return uploadedFileRepository.save(record);
    }

    @Transactional(readOnly = true)
    public UploadedFile getById(Long id) {
        return uploadedFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
    }

    @Transactional(readOnly = true)
    public List<UploadedFile> getByRecord(FileRecordType recordType, Long recordId) {
        return uploadedFileRepository.findByRecordTypeAndRecordId(recordType, recordId);
    }

    @Transactional(readOnly = true)
    public List<UploadedFile> getMyFiles() {
        Long userId = currentUserService.getCurrentUser().getId();
        return uploadedFileRepository.findByUploadedByIdOrderByUploadedAtDesc(userId);
    }
}
