package edu.cit.ursulo.bytezone.service;

import edu.cit.ursulo.bytezone.dto.request.LoginRequest;
import edu.cit.ursulo.bytezone.dto.request.RegisterRequest;
import edu.cit.ursulo.bytezone.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}