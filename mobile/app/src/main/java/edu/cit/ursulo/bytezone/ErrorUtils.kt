package edu.cit.ursulo.bytezone

import org.json.JSONObject
import retrofit2.Response

object ErrorUtils {
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