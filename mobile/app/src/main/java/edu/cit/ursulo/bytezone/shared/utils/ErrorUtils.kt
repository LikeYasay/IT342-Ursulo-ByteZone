package edu.cit.ursulo.bytezone.shared.utils

import org.json.JSONObject
import retrofit2.Response

object ErrorUtils {
    const val CONNECTION_ERROR_MESSAGE =
        "Cannot connect to ByteZone server. Please check backend URL or internet connection."

    fun parseError(response: Response<*>): String {
        return try {
            val raw = response.errorBody()?.string()
            if (raw.isNullOrBlank()) {
                "Request failed."
            } else {
                JSONObject(raw).optString("message", raw)
            }
        } catch (e: Exception) {
            "Request failed."
        }
    }
}
