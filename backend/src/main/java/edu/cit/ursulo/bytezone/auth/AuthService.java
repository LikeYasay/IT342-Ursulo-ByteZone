package edu.cit.ursulo.bytezone.auth;

import edu.cit.ursulo.bytezone.security.JwtService;
import edu.cit.ursulo.bytezone.shared.EmailService;
import edu.cit.ursulo.bytezone.users.Role;
import edu.cit.ursulo.bytezone.users.User;
import edu.cit.ursulo.bytezone.users.UserRepository;
import edu.cit.ursulo.bytezone.users.UserResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        if (user.getTournamentWins() == null) {
            user.setTournamentWins(0);
        }

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getEmail());

        emailService.sendRegistrationEmail(savedUser.getEmail(), savedUser.getFullName());

        return new AuthResponse(
                token,
                mapToUserResponse(savedUser)
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                mapToUserResponse(user)
        );
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getTournamentWins()
        );
    }
}