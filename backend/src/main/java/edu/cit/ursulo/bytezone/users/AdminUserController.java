package edu.cit.ursulo.bytezone.users;

import edu.cit.ursulo.bytezone.shared.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getAllUsers(),
                "Users fetched successfully"
        ));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateUser(userId, request),
                "User updated successfully"
        ));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);

        return ResponseEntity.ok(ApiResponse.success(
                null,
                "User deleted successfully"
        ));
    }
}