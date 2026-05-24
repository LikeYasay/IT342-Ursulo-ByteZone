package edu.cit.ursulo.bytezone.shared.utils

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.auth.LoginActivity
import edu.cit.ursulo.bytezone.auth.SessionManager
import retrofit2.Response

object UiUtils {
    fun toast(activity: Activity, message: String) {
        Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
    }

    fun longToast(activity: Activity, message: String) {
        Toast.makeText(activity, message, Toast.LENGTH_LONG).show()
    }

    fun errorFrom(response: Response<*>): String = ErrorUtils.parseError(response)

    fun logoutToLogin(activity: Activity, sessionManager: SessionManager) {
        sessionManager.clearSession()
        activity.startActivity(Intent(activity, LoginActivity::class.java))
        activity.finish()
    }

    fun hideKeyboard(activity: Activity) {
        val imm = ContextCompat.getSystemService(activity, InputMethodManager::class.java)
        val view = activity.currentFocus ?: View(activity)
        imm?.hideSoftInputFromWindow(view.windowToken, 0)
    }

    fun applyStatusColor(textView: TextView, status: String?) {
        val color = when (status) {
            "PAID", "APPROVED", "ACTIVE", "READY", "COMPLETED", "SERVED" -> R.color.bytezone_success
            "FAILED", "CANCELLED" -> R.color.bytezone_error
            "PENDING", "INITIATED", "PROCESSING", "PREPARING", "CHECKED_IN" -> R.color.bytezone_cyan
            else -> R.color.bytezone_muted
        }
        textView.setTextColor(ContextCompat.getColor(textView.context, color))
    }

    fun setDisabledAlpha(view: View, disabled: Boolean) {
        view.alpha = if (disabled) 0.55f else 1f
        view.isEnabled = !disabled
    }

    fun subtleDivider(context: android.content.Context): View {
        return View(context).apply {
            setBackgroundColor(Color.parseColor("#222222"))
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                1
            ).apply {
                topMargin = 10
                bottomMargin = 10
            }
        }
    }
}
