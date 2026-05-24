package edu.cit.ursulo.bytezone.shared.utils

import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import kotlin.math.max

object DateTimeUtils {
    private val dateTimeFormats = listOf(
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSSSS", Locale.US),
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS", Locale.US),
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
    )

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    private val timeFormat = SimpleDateFormat("HH:mm", Locale.US)
    private val displayDateTime = SimpleDateFormat("MMM d, yyyy h:mm a", Locale.US)
    private val displayDate = SimpleDateFormat("MMM d, yyyy", Locale.US)
    private val moneyFormat = NumberFormat.getNumberInstance(Locale.US).apply {
        minimumFractionDigits = 2
        maximumFractionDigits = 2
    }

    fun todayIso(): String = dateFormat.format(Calendar.getInstance().time)

    fun timeIso(hour: Int, minute: Int): String = "%02d:%02d".format(hour, minute)

    fun calendarDateIso(year: Int, month: Int, day: Int): String {
        val calendar = Calendar.getInstance()
        calendar.set(year, month, day, 0, 0, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return dateFormat.format(calendar.time)
    }

    fun formatDate(value: String?): String {
        if (value.isNullOrBlank()) return "N/A"
        return runCatching { displayDate.format(dateFormat.parse(value)!!) }.getOrElse { value }
    }

    fun formatDateTime(value: String?): String {
        if (value.isNullOrBlank()) return "N/A"
        val parsed = parseDateTime(value)
        return if (parsed != null) displayDateTime.format(parsed) else value
    }

    fun formatTime(value: String?): String {
        if (value.isNullOrBlank()) return "N/A"
        return runCatching {
            val parsed = timeFormat.parse(value)
            SimpleDateFormat("h:mm a", Locale.US).format(parsed!!)
        }.getOrElse { value }
    }

    fun formatCurrency(value: Double?): String {
        return "PHP ${moneyFormat.format(value ?: 0.0)}"
    }

    fun countdownTo(endTime: String?): String {
        val end = parseDateTime(endTime) ?: return "00:00:00"
        val diff = max(0L, (end.time - System.currentTimeMillis()) / 1000L)
        val hours = diff / 3600L
        val minutes = (diff % 3600L) / 60L
        val seconds = diff % 60L
        return "%02d:%02d:%02d".format(hours, minutes, seconds)
    }

    fun parseDateTime(value: String?) = value?.let { raw ->
        dateTimeFormats.firstNotNullOfOrNull { format ->
            runCatching { format.parse(raw) }.getOrNull()
        }
    }
}
