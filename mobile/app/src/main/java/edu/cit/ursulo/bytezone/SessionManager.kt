package edu.cit.ursulo.bytezone

import android.content.Context

class SessionManager(context: Context) {

    private val prefs = context.getSharedPreferences("bytezone_session", Context.MODE_PRIVATE)

    fun saveSession(token: String, fullName: String, email: String) {
        prefs.edit()
            .putString("token", token)
            .putString("fullName", fullName)
            .putString("email", email)
            .apply()
    }

    fun clearSession() {
        prefs.edit().clear().apply()
    }

    fun getToken(): String? = prefs.getString("token", null)
    fun getFullName(): String? = prefs.getString("fullName", null)
    fun getEmail(): String? = prefs.getString("email", null)
    fun isLoggedIn(): Boolean = !getToken().isNullOrEmpty()
}