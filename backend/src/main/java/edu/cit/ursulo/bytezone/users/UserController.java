package edu.cit.ursulo.bytezone.users;

import edu.cit.ursulo.bytezone.auth.CurrentUserService;
import edu.cit.ursulo.bytezone.auth.MeResponse;
import edu.cit.ursulo.bytezone.shared.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final CurrentUserService currentUserService;
    private final UserService userService;

    public UserController(CurrentUserService currentUserService,
                          UserService userService) {
        this.currentUserService = currentUserService;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MeResponse>> me() {
        User user = currentUserService.getCurrentUser();

        MeResponse response = mapToMeResponse(user);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Current user fetched successfully")
        );
    }

    @PutMapping("/user/me")
    public ResponseEntity<ApiResponse<MeResponse>> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        User updated = userService.updateMyProfile(request);

        MeResponse response = mapToMeResponse(updated);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Profile updated successfully")
        );
    }

private MeResponse mapToMeResponse(User user) {
    return new MeResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole().name(),
            user.getTournamentWins(),
            user.getTotalHoursPlayed(),
            user.getTotalHoursPlayedMinutes(),
            user.getProfileImageUrl(),
            user.getCreatedAt()
    );
}
}