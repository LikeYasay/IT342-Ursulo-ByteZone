package edu.cit.ursulo.bytezone.uploads;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import edu.cit.ursulo.bytezone.users.User;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user/me")
public class ProfileUploadController {

    private final ProfileUploadService profileUploadService;

    public ProfileUploadController(ProfileUploadService profileUploadService) {
        this.profileUploadService = profileUploadService;
    }

    @PutMapping(
            value = "/profile-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<User>> uploadProfileImage(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                profileUploadService.uploadMyProfileImage(file),
                "Profile image uploaded successfully"
        ));
    }
}