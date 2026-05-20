package edu.cit.ursulo.bytezone.uploads;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    List<UploadedFile> findByRecordTypeAndRecordId(FileRecordType recordType, Long recordId);
    List<UploadedFile> findByUploadedByIdOrderByUploadedAtDesc(Long userId);
}
