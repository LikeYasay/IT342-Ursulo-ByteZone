package edu.cit.ursulo.bytezone.controller;

import edu.cit.ursulo.bytezone.dto.response.ApiResponse;
import edu.cit.ursulo.bytezone.dto.response.MeResponse;
import edu.cit.ursulo.bytezone.entity.User;
import edu.cit.ursulo.bytezone.service.CurrentUserService;
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
                user.getTournamentWins()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Current user fetched successfully"));
    }
}