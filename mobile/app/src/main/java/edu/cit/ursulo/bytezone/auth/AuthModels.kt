package edu.cit.ursulo.bytezone.auth

import edu.cit.ursulo.bytezone.shared.api.UserDto

data class RegisterRequest(
    val fullName: String,
    val email: String,
    val password: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class GoogleLoginRequest(
    val googleIdToken: String
)

data class ProfileUpdateRequest(
    val fullName: String? = null,
    val email: String? = null,
    val password: String? = null,
    val removeProfileImage: Boolean? = null
)

data class AuthResponse(
    val accessToken: String? = null,
    val user: UserDto? = null
)
