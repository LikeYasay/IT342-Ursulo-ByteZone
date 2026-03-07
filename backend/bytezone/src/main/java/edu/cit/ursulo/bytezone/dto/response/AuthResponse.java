package edu.cit.ursulo.bytezone.dto.response;

public class AuthResponse {

    private String accessToken;
    private UserResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String accessToken, UserResponse user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}