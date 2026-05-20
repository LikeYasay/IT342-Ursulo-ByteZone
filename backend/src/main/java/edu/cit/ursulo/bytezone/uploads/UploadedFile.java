package edu.cit.ursulo.bytezone.uploads;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import edu.cit.ursulo.bytezone.users.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "uploaded_files")
public class UploadedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "secure_url", nullable = false, length = 1024)
    private String secureUrl;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false)
    private FileRecordType recordType;

    @Column(name = "record_id", nullable = false)
    private Long recordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    public UploadedFile() {
    }

    @PrePersist
    public void prePersist() {
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getSecureUrl() { return secureUrl; }
    public String getMimeType() { return mimeType; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public FileRecordType getRecordType() { return recordType; }
    public Long getRecordId() { return recordId; }
    public User getUploadedBy() { return uploadedBy; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }

    public void setId(Long id) { this.id = id; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setSecureUrl(String secureUrl) { this.secureUrl = secureUrl; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
    public void setRecordType(FileRecordType recordType) { this.recordType = recordType; }
    public void setRecordId(Long recordId) { this.recordId = recordId; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
