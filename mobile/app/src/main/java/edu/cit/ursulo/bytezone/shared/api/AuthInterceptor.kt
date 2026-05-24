package edu.cit.ursulo.bytezone.shared.api

import edu.cit.ursulo.bytezone.auth.SessionManager
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(
    private val sessionManager: SessionManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val path = original.url.encodedPath
        val isAuthRoute = path == "/api/auth/login" ||
            path == "/api/auth/register" ||
            path == "/api/auth/google"

        val token = sessionManager.getToken()
        val request = if (!token.isNullOrBlank() && !isAuthRoute) {
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            original
        }

        return chain.proceed(request)
    }
}
