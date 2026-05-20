package edu.cit.ursulo.bytezone.uploads;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    /**
     * POST /api/files/upload
     * Upload a file and link it to a record.
     * Body: multipart/form-data with fields: file, recordType (PAYMENT|ORDER|RESERVATION), recordId
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadedFile>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("recordType") FileRecordType recordType,
            @RequestParam("recordId") Long recordId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(fileUploadService.upload(file, recordType, recordId), "File uploaded successfully")
        );
    }

    /**
     * GET /api/files/{id}
     * Get file metadata by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UploadedFile>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(fileUploadService.getById(id), "File fetched successfully")
        );
    }

    /**
     * GET /api/files?recordType=X&recordId=Y
     * Get all files linked to a specific record.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UploadedFile>>> getByRecord(
            @RequestParam("recordType") FileRecordType recordType,
            @RequestParam("recordId") Long recordId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(fileUploadService.getByRecord(recordType, recordId), "Files fetched successfully")
        );
    }

    /**
     * GET /api/files/mine
     * Get all files uploaded by the current user.
     */
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<UploadedFile>>> getMyFiles() {
        return ResponseEntity.ok(
                ApiResponse.success(fileUploadService.getMyFiles(), "Your files fetched successfully")
        );
    }
}
