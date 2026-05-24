package edu.cit.ursulo.bytezone.notifications

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.databinding.FragmentNotificationsBinding
import edu.cit.ursulo.bytezone.shared.api.NotificationDto
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.utils.DateTimeUtils
import edu.cit.ursulo.bytezone.shared.utils.UiUtils
import kotlinx.coroutines.launch

class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!

    private lateinit var api: NotificationApiService

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        api = RetrofitClient.create(requireContext(), NotificationApiService::class.java)
        binding.btnRefreshNotifications.setOnClickListener { loadNotifications() }
        loadNotifications()
    }

    override fun onDestroyView() {
        _binding = null
        super.onDestroyView()
    }

    private fun loadNotifications() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val notifications = api.myNotifications().body()?.data.orEmpty()
                val unread = api.unreadCount().body()?.data ?: notifications.count { it.readStatus != true }.toLong()
                binding.tvUnreadCount.text = "Unread: $unread"
                renderNotifications(notifications)
            } catch (e: Exception) {
                binding.tvUnreadCount.text = "Unread: N/A"
                renderNotifications(emptyList())
            }
        }
    }

    private fun renderNotifications(notifications: List<NotificationDto>) {
        binding.notificationsContainer.removeAllViews()
        if (notifications.isEmpty()) {
            binding.notificationsContainer.addView(text("No notifications yet.", 14, R.color.bytezone_muted, false))
            return
        }

        notifications.forEach { notification ->
            binding.notificationsContainer.addView(notificationCard(notification))
        }
    }

    private fun notificationCard(notification: NotificationDto): View {
        val unread = notification.readStatus != true
        val card = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundResource(if (unread) R.drawable.bg_card_selected else R.drawable.bg_card_subtle)
            setPadding(dp(16), dp(14), dp(16), dp(14))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(12) }
            setOnClickListener {
                val id = notification.id
                if (id != null && unread) {
                    markAsRead(id)
                }
            }
        }

        card.addView(text(notification.title ?: "Notification", 16, R.color.white, true))
        card.addView(text(notification.message ?: "No details.", 14, R.color.bytezone_muted, false).apply {
            setPadding(0, dp(8), 0, 0)
        })
        card.addView(text(notification.type ?: "UPDATE", 12, R.color.bytezone_cyan, true).apply {
            setPadding(0, dp(8), 0, 0)
        })
        card.addView(text(DateTimeUtils.formatDateTime(notification.createdAt), 12, R.color.bytezone_muted, false).apply {
            setPadding(0, dp(8), 0, 0)
        })

        return card
    }

    private fun markAsRead(notificationId: Long) {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                api.markAsRead(notificationId)
                loadNotifications()
            } catch (e: Exception) {
                UiUtils.longToast(requireActivity(), "Unable to mark notification as read.")
            }
        }
    }

    private fun text(value: String, sp: Int, colorRes: Int, bold: Boolean): TextView {
        return TextView(requireContext()).apply {
            text = value
            textSize = sp.toFloat()
            setTextColor(ContextCompat.getColor(requireContext(), colorRes))
            if (bold) setTypeface(typeface, android.graphics.Typeface.BOLD)
        }
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}
