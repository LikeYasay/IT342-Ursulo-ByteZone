package edu.cit.ursulo.bytezone.shared.utils

import android.graphics.BitmapFactory
import android.widget.ImageView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

object ImageLoader {
    suspend fun load(imageView: ImageView, imageUrl: String?) {
        if (imageUrl.isNullOrBlank()) return

        val bitmap = withContext(Dispatchers.IO) {
            runCatching {
                val connection = URL(imageUrl).openConnection() as HttpURLConnection
                connection.connectTimeout = 8000
                connection.readTimeout = 8000
                connection.inputStream.use { BitmapFactory.decodeStream(it) }
            }.getOrNull()
        }

        if (bitmap != null) {
            imageView.setImageBitmap(bitmap)
        }
    }
}
