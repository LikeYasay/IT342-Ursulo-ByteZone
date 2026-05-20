package edu.cit.ursulo.bytezone.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import edu.cit.ursulo.bytezone.security.JwtService;
import edu.cit.ursulo.bytezone.users.Role;
import edu.cit.ursulo.bytezone.users.User;
import edu.cit.ursulo.bytezone.users.UserRepository;
import edu.cit.ursulo.bytezone.users.UserResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final String googleClientId;

    public GoogleAuthService(UserRepository userRepository,
                             JwtService jwtService,
                             @Value("${google.client-id:}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId;
    }

    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new RuntimeException("Google OAuth is not configured on this server. Set GOOGLE_CLIENT_ID.");
        }

        GoogleIdToken.Payload payload = verifyToken(idToken);

        String email = payload.getEmail().toLowerCase();
        String fullName = (String) payload.get("name");
        if (fullName == null || fullName.isBlank()) {
            fullName = email.split("@")[0];
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFullName(fullName);
            // Random unusable password — Google users log in via OAuth only
            user.setPassword("GOOGLE_OAUTH_" + System.currentTimeMillis());
            user.setRole(Role.USER);
            user.setTournamentWins(0);
            user = userRepository.save(user);
            log.info("[GoogleAuth] Created new user via Google OAuth: {}", email);
        } else {
            log.info("[GoogleAuth] Existing user logged in via Google OAuth: {}", email);
        }

        String jwt = jwtService.generateToken(user.getEmail());

        return new AuthResponse(jwt, new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getTournamentWins()
        ));
    }

    private GoogleIdToken.Payload verifyToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            ).setAudience(Collections.singletonList(googleClientId)).build();

            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new RuntimeException("Invalid Google ID token");
            }
            return token.getPayload();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Google token verification failed: " + e.getMessage());
        }
    }
}
