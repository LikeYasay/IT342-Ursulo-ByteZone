package edu.cit.ursulo.bytezone.users;

import edu.cit.ursulo.bytezone.auth.CurrentUserService;
import edu.cit.ursulo.bytezone.auth.MeResponse;
import edu.cit.ursulo.bytezone.shared.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final CurrentUserService currentUserService;

    public UserController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MeResponse>> me() {
        User user = currentUserService.getCurrentUser();

        MeResponse response = new MeResponse(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getRole().name(),
        user.getTournamentWins(),
        user.getProfileImageUrl()
    );

        return ResponseEntity.ok(ApiResponse.success(response, "Current user fetched successfully"));
    }
}