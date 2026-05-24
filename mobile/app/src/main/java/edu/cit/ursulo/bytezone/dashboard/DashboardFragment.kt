package edu.cit.ursulo.bytezone.dashboard

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.auth.SessionManager
import edu.cit.ursulo.bytezone.databinding.FragmentDashboardBinding
import edu.cit.ursulo.bytezone.main.MainActivity
import edu.cit.ursulo.bytezone.payments.SandboxCheckoutActivity
import edu.cit.ursulo.bytezone.shared.api.AnnouncementDto
import edu.cit.ursulo.bytezone.shared.api.CafeSessionDto
import edu.cit.ursulo.bytezone.shared.api.GamingHighlightDto
import edu.cit.ursulo.bytezone.shared.api.PaymentDto
import edu.cit.ursulo.bytezone.shared.api.ReservationDto
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.api.SnackOrderDto
import edu.cit.ursulo.bytezone.shared.api.UserDto
import edu.cit.ursulo.bytezone.shared.utils.DateTimeUtils
import edu.cit.ursulo.bytezone.shared.utils.ImageLoader
import edu.cit.ursulo.bytezone.shared.utils.UiUtils
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private lateinit var api: DashboardApiService
    private lateinit var sessionManager: SessionManager
    private var activeSession: CafeSessionDto? = null
    private var timerJob: Job? = null
    private var pollJob: Job? = null
    private var latestPendingPaymentId: Long? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        api = RetrofitClient.create(requireContext(), DashboardApiService::class.java)
        sessionManager = SessionManager(requireContext())

        binding.btnBookStation.setOnClickListener {
            (activity as? MainActivity)?.openTab(R.id.nav_booking)
        }
        binding.btnOrderSnacks.setOnClickListener {
            (activity as? MainActivity)?.openTab(R.id.nav_orders)
        }
        binding.btnTransactions.setOnClickListener {
            (activity as? MainActivity)?.openTab(R.id.nav_transactions)
        }
        binding.btnNotifications.setOnClickListener {
            (activity as? MainActivity)?.openNotifications()
        }
        binding.btnPayLatest.setOnClickListener {
            latestPendingPaymentId?.let { openPayment(it) }
        }

        loadDashboard(showErrors = true)
        startTimer()
        startSessionPolling()
    }

    override fun onDestroyView() {
        timerJob?.cancel()
        pollJob?.cancel()
        _binding = null
        super.onDestroyView()
    }

    private fun loadDashboard(showErrors: Boolean) {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val user = api.me().body()?.data
                val reservations = api.myReservations().body()?.data.orEmpty()
                val orders = api.myOrders().body()?.data.orEmpty()
                val payments = api.myPayments().body()?.data.orEmpty()
                val announcements = api.announcements().body()?.data.orEmpty()
                val session = api.myActiveSession().body()?.data
                val unread = api.unreadCount().body()?.data ?: 0L

                activeSession = session
                renderUser(user)
                renderSession(session)
                renderReservation(reservations)
                renderPendingPayments(payments)
                renderAnnouncements(announcements)
                renderUnread(unread)
                renderActivityMeta(session, reservations, orders, payments)
            } catch (e: Exception) {
                if (showErrors) {
                    UiUtils.longToast(requireActivity(), "Failed to load dashboard: ${e.message}")
                }
            }

            renderHighlights()
        }
    }

    private fun renderUser(user: UserDto?) {
        val currentUser = user ?: return
        if (currentUser.role != "USER") {
            UiUtils.longToast(
                requireActivity(),
                "Mobile app is for user accounts only. Please use the web admin dashboard."
            )
            UiUtils.logoutToLogin(requireActivity(), sessionManager)
            return
        }

        sessionManager.saveUser(
            fullName = currentUser.fullName,
            email = currentUser.email,
            role = currentUser.role,
            userId = currentUser.id,
            profileImageUrl = currentUser.profileImageUrl
        )

        val name = currentUser.fullName?.trim().orEmpty().ifBlank { "Player" }
        val firstName = name.split(Regex("\\s+")).firstOrNull().orEmpty().ifBlank { "Player" }
        binding.tvGreeting.text = "$firstName's Status"
        binding.tvTotalHours.text = formatCompactNumber(currentUser.totalHoursPlayed ?: 0.0)
        binding.tvTournamentWins.text = (currentUser.tournamentWins ?: 0).toString()
    }

    private fun renderActivityMeta(
        session: CafeSessionDto?,
        reservations: List<ReservationDto>,
        orders: List<SnackOrderDto>,
        payments: List<PaymentDto>
    ) {
        val latestTime = session?.startTime
            ?: orders.firstOrNull()?.createdAt
            ?: payments.firstOrNull()?.createdAt
            ?: reservations.firstOrNull()?.createdAt
        binding.tvLastPlayed.text = DateTimeUtils.formatDateTime(latestTime)
        binding.tvFavoriteGame.text = "N/A"
    }

    private fun renderSession(session: CafeSessionDto?) {
        binding.tvRemainingTime.text = DateTimeUtils.countdownTo(session?.endTime)
        binding.tvSessionStatus.text = session?.status ?: "Inactive"
        binding.tvSessionStation.text = "Station: ${session?.station?.stationNo ?: "N/A"}"
        UiUtils.applyStatusColor(binding.tvSessionStatus, session?.status)
    }

    private fun renderReservation(reservations: List<ReservationDto>) {
        val latest = reservations.firstOrNull {
            it.status == "PENDING" || it.status == "APPROVED" || it.status == "CHECKED_IN"
        } ?: reservations.firstOrNull()

        if (latest == null) {
            binding.tvReservationDateTime.text = "Date and time: N/A"
            binding.tvReservedStation.text = "Station: N/A"
            binding.tvReservationDuration.text = "Duration: N/A"
            binding.tvReservationStatus.text = "No Reservation"
            UiUtils.applyStatusColor(binding.tvReservationStatus, null)
            return
        }

        val date = DateTimeUtils.formatDate(latest.date ?: latest.reservationDate)
        val time = DateTimeUtils.formatTime(latest.startTime)
        binding.tvReservationDateTime.text = "Date and time: $date, $time"
        binding.tvReservedStation.text = "Station: ${latest.station?.stationNo ?: "N/A"}"
        binding.tvReservationDuration.text = "Duration: ${latest.durationMinutes ?: 0} min"
        binding.tvReservationStatus.text = latest.status ?: "N/A"
        UiUtils.applyStatusColor(binding.tvReservationStatus, latest.status)
    }

    private fun renderPendingPayments(payments: List<PaymentDto>) {
        val pending = payments.filter { it.status in setOf("PENDING", "INITIATED", "PROCESSING") }
        val latest = pending.firstOrNull()
        latestPendingPaymentId = latest?.id

        if (latest == null) {
            binding.tvPendingPayments.text = "No pending payments."
            binding.btnPayLatest.visibility = View.GONE
            return
        }

        binding.tvPendingPayments.text =
            "${pending.size} pending payment(s). Latest: ${latest.type ?: "PAYMENT"} ${DateTimeUtils.formatCurrency(latest.amount)}"
        binding.btnPayLatest.visibility = View.VISIBLE
    }

    private fun renderAnnouncements(announcements: List<AnnouncementDto>) {
        binding.announcementsContainer.removeAllViews()
        if (announcements.isEmpty()) {
            binding.announcementsContainer.addView(emptyText("No announcements yet."))
            return
        }

        announcements.take(4).forEach { announcement ->
            binding.announcementsContainer.addView(
                infoCard(
                    title = announcement.title ?: "ByteZone Update",
                    body = announcement.description ?: "No details provided.",
                    footer = DateTimeUtils.formatDateTime(announcement.createdAt)
                )
            )
        }
    }

    private fun renderUnread(unread: Long) {
        binding.tvUnreadBadge.visibility = if (unread > 0) View.VISIBLE else View.GONE
        binding.tvUnreadBadge.text = unread.coerceAtMost(99).toString()
    }

    private fun renderHighlights() {
        viewLifecycleOwner.lifecycleScope.launch {
            val highlights = runCatching {
                api.gamingHighlights().body()?.data.orEmpty()
                    .filter { !it.name.isNullOrBlank() }
            }.getOrDefault(emptyList())

            binding.highlightsContainer.removeAllViews()
            val items = if (highlights.isEmpty()) {
                listOf(
                    GamingHighlightDto(name = "Valorant"),
                    GamingHighlightDto(name = "Counter-Strike"),
                    GamingHighlightDto(name = "League of Legends")
                )
            } else {
                highlights.take(8)
            }

            items.forEach { highlight ->
                binding.highlightsContainer.addView(highlightCard(highlight))
            }
        }
    }

    private fun startTimer() {
        timerJob?.cancel()
        timerJob = viewLifecycleOwner.lifecycleScope.launch {
            while (isActive) {
                _binding?.tvRemainingTime?.text = DateTimeUtils.countdownTo(activeSession?.endTime)
                delay(1000)
            }
        }
    }

    private fun startSessionPolling() {
        pollJob?.cancel()
        pollJob = viewLifecycleOwner.lifecycleScope.launch {
            while (isActive) {
                delay(30000)
                runCatching {
                    activeSession = api.myActiveSession().body()?.data
                    renderSession(activeSession)
                }
            }
        }
    }

    private fun openPayment(paymentId: Long) {
        startActivity(Intent(requireContext(), SandboxCheckoutActivity::class.java).putExtra("paymentId", paymentId))
    }

    private fun infoCard(title: String, body: String, footer: String): View {
        val context = requireContext()
        val card = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundResource(R.drawable.bg_card_subtle)
            setPadding(dp(14), dp(12), dp(14), dp(12))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(10) }
        }

        card.addView(text(title, 15, R.color.bytezone_cyan, true))
        card.addView(text(body, 13, R.color.white, false).apply {
            setPadding(0, dp(5), 0, 0)
        })
        if (footer != "N/A") {
            card.addView(text(footer, 11, R.color.bytezone_muted, false).apply {
                setPadding(0, dp(6), 0, 0)
            })
        }
        return card
    }

    private fun highlightCard(highlight: GamingHighlightDto): View {
        val context = requireContext()
        val card = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundResource(R.drawable.bg_card_subtle)
            setPadding(dp(10), dp(10), dp(10), dp(10))
            layoutParams = LinearLayout.LayoutParams(dp(178), LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                marginEnd = dp(12)
            }
        }

        val image = ImageView(context).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setBackgroundColor(ContextCompat.getColor(context, R.color.bytezone_card))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(104)
            )
        }
        card.addView(image)
        card.addView(text(highlight.name ?: "Game Highlight", 14, R.color.white, true).apply {
            setPadding(0, dp(10), 0, 0)
            maxLines = 2
        })
        if (highlight.rating != null) {
            card.addView(text("Rating: ${highlight.rating}", 12, R.color.bytezone_cyan, false))
        }

        if (!highlight.background.isNullOrBlank()) {
            viewLifecycleOwner.lifecycleScope.launch {
                ImageLoader.load(image, highlight.background)
            }
        }

        return card
    }

    private fun emptyText(value: String): TextView {
        return text(value, 14, R.color.bytezone_muted, false).apply {
            setPadding(0, dp(6), 0, dp(6))
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

    private fun formatCompactNumber(value: Double): String {
        return if (value % 1.0 == 0.0) value.toInt().toString() else "%.1f".format(value)
    }
}
