package edu.cit.ursulo.bytezone.shared.utils

import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone
import kotlin.math.max

object DateTimeUtils {
    private val manilaTimeZone = TimeZone.getTimeZone("Asia/Manila")
    private val timezoneSuffix = Regex("(Z|[+-]\\d{2}:?\\d{2})$")
    private val longFraction = Regex("\\.(\\d{3})\\d+")

    private fun formatter(pattern: String, timeZone: TimeZone = manilaTimeZone): SimpleDateFormat {
        return SimpleDateFormat(pattern, Locale.US).apply {
            this.timeZone = timeZone
        }
    }

    private val localDateTimeFormats = listOf(
        formatter("yyyy-MM-dd'T'HH:mm:ss.SSS"),
        formatter("yyyy-MM-dd'T'HH:mm:ss")
    )
    private val zonedDateTimeFormats = listOf(
        formatter("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", TimeZone.getTimeZone("UTC")),
        formatter("yyyy-MM-dd'T'HH:mm:ssXXX", TimeZone.getTimeZone("UTC")),
        formatter("yyyy-MM-dd'T'HH:mm:ss.SSSX", TimeZone.getTimeZone("UTC")),
        formatter("yyyy-MM-dd'T'HH:mm:ssX", TimeZone.getTimeZone("UTC"))
    )

    private val dateFormat = formatter("yyyy-MM-dd")
    private val timeFormat = formatter("HH:mm")
    private val displayDateTime = formatter("MMM d, yyyy h:mm a")
    private val displayDate = formatter("MMM d, yyyy")
    private val moneyFormat = NumberFormat.getNumberInstance(Locale.US).apply {
        minimumFractionDigits = 2
        maximumFractionDigits = 2
    }

    fun todayIso(): String = dateFormat.format(Calendar.getInstance(manilaTimeZone).time)

    fun timeIso(hour: Int, minute: Int): String = "%02d:%02d".format(hour, minute)

    fun calendarDateIso(year: Int, month: Int, day: Int): String {
        val calendar = Calendar.getInstance(manilaTimeZone)
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
            formatter("h:mm a").format(parsed!!)
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

    @Synchronized
    fun parseDateTime(value: String?) = value?.let { raw ->
        val normalized = raw.trim().replace(longFraction, ".$1")
        val formats = if (timezoneSuffix.containsMatchIn(normalized)) {
            zonedDateTimeFormats
        } else {
            localDateTimeFormats
        }

        formats.firstNotNullOfOrNull { format ->
            runCatching { format.parse(normalized) }.getOrNull()
        }
    }
}
