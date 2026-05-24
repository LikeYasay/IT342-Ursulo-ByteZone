package edu.cit.ursulo.bytezone.auth

import android.content.Context

class SessionManager(context: Context) {

    private val prefs = context.getSharedPreferences("bytezone_session", Context.MODE_PRIVATE)

    fun saveSession(
        token: String,
        fullName: String,
        email: String,
        role: String,
        userId: Long? = null,
        profileImageUrl: String? = null
    ) {
        prefs.edit()
            .putString("token", token)
            .putString("fullName", fullName)
            .putString("email", email)
            .putString("role", role)
            .putLong("userId", userId ?: -1L)
            .putString("profileImageUrl", profileImageUrl)
            .apply()
    }

    fun saveUser(
        fullName: String?,
        email: String?,
        role: String?,
        userId: Long?,
        profileImageUrl: String?
    ) {
        prefs.edit()
            .putString("fullName", fullName)
            .putString("email", email)
            .putString("role", role)
            .putLong("userId", userId ?: -1L)
            .putString("profileImageUrl", profileImageUrl)
            .apply()
    }

    fun clearSession() {
        prefs.edit().clear().apply()
    }

    fun getToken(): String? = prefs.getString("token", null)
    fun getFullName(): String? = prefs.getString("fullName", null)
    fun getEmail(): String? = prefs.getString("email", null)
    fun getRole(): String? = prefs.getString("role", null)
    fun getUserId(): Long? = prefs.getLong("userId", -1L).takeIf { it > 0L }
    fun getProfileImageUrl(): String? = prefs.getString("profileImageUrl", null)
    fun isLoggedIn(): Boolean = !getToken().isNullOrEmpty()
    fun isUserSession(): Boolean = getRole() == "USER"
}
