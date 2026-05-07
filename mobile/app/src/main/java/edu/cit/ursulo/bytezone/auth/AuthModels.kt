package edu.cit.ursulo.bytezone.auth

data class RegisterRequest(
    val fullName: String,
    val email: String,
    val password: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class UserResponse(
    val id: Long,
    val fullName: String,
    val email: String,
    val role: String
)

data class AuthResponse(
    val accessToken: String,
    val user: UserResponse
)