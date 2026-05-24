package edu.cit.ursulo.bytezone.shared.api

object ApiConfig {
    const val LOCAL_EMULATOR_BASE_URL = "http://10.0.2.2:8080/"
    const val DEPLOYED_BASE_URL = "https://bytezone-backend.onrender.com/"

    // Toggle this one value when switching between Render and a local Spring Boot backend.
    const val USE_DEPLOYED_BACKEND = true

    val BASE_URL: String = if (USE_DEPLOYED_BACKEND) {
        DEPLOYED_BASE_URL
    } else {
        LOCAL_EMULATOR_BASE_URL
    }
}
