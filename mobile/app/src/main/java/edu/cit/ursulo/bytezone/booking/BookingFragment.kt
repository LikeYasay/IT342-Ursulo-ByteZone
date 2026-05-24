package edu.cit.ursulo.bytezone.booking

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.databinding.FragmentBookingBinding
import edu.cit.ursulo.bytezone.payments.PaymentApiService
import edu.cit.ursulo.bytezone.payments.SandboxCheckoutActivity
import edu.cit.ursulo.bytezone.shared.api.PaymentDto
import edu.cit.ursulo.bytezone.shared.api.ReservationDto
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.api.StationDto
import edu.cit.ursulo.bytezone.shared.utils.DateTimeUtils
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import edu.cit.ursulo.bytezone.shared.utils.UiUtils
import kotlinx.coroutines.launch
import java.util.Calendar

class BookingFragment : Fragment() {

    private var _binding: FragmentBookingBinding? = null
    private val binding get() = _binding!!

    private lateinit var api: BookingApiService
    private lateinit var paymentApi: PaymentApiService
    private var stations: List<StationDto> = emptyList()
    private var selectedStation: StationDto? = null
    private val ratePerHour = 50.0
    private val timeOptions = listOf(
        "Select time",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00"
    )

    private val durations = listOf(
        DurationOption("Select duration", 0),
        DurationOption("1 Hour", 60),
        DurationOption("2 Hours", 120),
        DurationOption("3 Hours", 180),
        DurationOption("4 Hours", 240),
        DurationOption("5 Hours", 300)
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBookingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        api = RetrofitClient.create(requireContext(), BookingApiService::class.java)
        paymentApi = RetrofitClient.create(requireContext(), PaymentApiService::class.java)

        setupDurationSpinner()
        setupTimeSpinner()
        binding.etDate.setOnClickListener { showDatePicker() }
        binding.btnConfirmBooking.setOnClickListener { confirmBooking() }
        binding.btnClearBooking.setOnClickListener { clearForm() }

        loadBookingData()
    }

    override fun onDestroyView() {
        _binding = null
        super.onDestroyView()
    }

    private fun setupDurationSpinner() {
        binding.spDuration.adapter = darkSpinnerAdapter(durations.map { it.label })
        binding.spDuration.setSelection(0)
        binding.spDuration.setOnItemSelectedListener(object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                updateBookingTotal()
            }

            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) = Unit
        })
    }

    private fun loadBookingData() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                stations = api.stations().body()?.data.orEmpty()
                val reservations = api.myReservations().body()?.data.orEmpty()
                renderStations()
                renderLatestReservation(reservations.firstOrNull())
            } catch (e: Exception) {
                UiUtils.longToast(requireActivity(), ErrorUtils.CONNECTION_ERROR_MESSAGE)
            }
        }
    }

    private fun setupTimeSpinner() {
        binding.spTime.adapter = darkSpinnerAdapter(
            timeOptions.map { if (it == "Select time") it else DateTimeUtils.formatTime(it) }
        )
        binding.spTime.setSelection(0)
    }

    private fun darkSpinnerAdapter(labels: List<String>): ArrayAdapter<String> {
        return object : ArrayAdapter<String>(requireContext(), android.R.layout.simple_spinner_item, labels) {
            override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
                return (super.getView(position, convertView, parent) as TextView).apply {
                    setTextColor(ContextCompat.getColor(requireContext(), R.color.white))
                    textSize = 14f
                }
            }

            override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup): View {
                return (super.getDropDownView(position, convertView, parent) as TextView).apply {
                    setTextColor(ContextCompat.getColor(requireContext(), R.color.white))
                    setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.bytezone_bg))
                    textSize = 14f
                    setPadding(dp(14), dp(12), dp(14), dp(12))
                }
            }
        }.apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
    }

    private fun renderStations() {
        binding.stationsContainer.removeAllViews()
        if (stations.isEmpty()) {
            binding.stationsContainer.addView(infoText("No stations available."))
            return
        }

        val grid = GridLayout(requireContext()).apply {
            columnCount = 4
            rowCount = (stations.size + 3) / 4
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        stations.forEach { station -> grid.addView(stationCard(station)) }
        binding.stationsContainer.addView(grid)
    }

    private fun stationCard(station: StationDto): View {
        val available = station.status == "AVAILABLE"
        val selected = selectedStation?.id == station.id
        val card = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            setPadding(dp(6), dp(8), dp(6), dp(8))
            setBackgroundResource(
                when {
                    selected -> R.drawable.bg_card_selected
                    available -> R.drawable.bg_card_subtle
                    else -> R.drawable.bg_card_disabled
                }
            )
            layoutParams = GridLayout.LayoutParams().apply {
                width = 0
                height = dp(64)
                columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
                setMargins(dp(4), dp(4), dp(4), dp(4))
            }
            isEnabled = available
            alpha = if (available) 1f else 0.62f
            setOnClickListener {
                if (available) {
                    selectedStation = station
                    binding.tvSelectedStation.text = "Selected station: ${station.stationNo ?: station.id}"
                    renderStations()
                }
            }
        }

        val name = text(station.stationNo ?: "S${station.id}", 14, R.color.white, true).apply {
            gravity = android.view.Gravity.CENTER
            maxLines = 1
        }
        card.addView(name)

        val status = text(
            when (station.status) {
                "AVAILABLE" -> "Open"
                "IN_USE" -> "In use"
                "RESERVED" -> "Reserved"
                else -> station.status ?: "N/A"
            },
            10,
            if (available || selected) R.color.bytezone_cyan else R.color.bytezone_muted,
            true
        ).apply {
            gravity = android.view.Gravity.CENTER
            maxLines = 1
            setPadding(0, dp(4), 0, 0)
        }
        card.addView(status)

        return card
    }

    private fun confirmBooking() {
        val station = selectedStation
        val date = binding.etDate.text.toString().trim()
        val time = timeOptions.getOrNull(binding.spTime.selectedItemPosition).orEmpty()
        val duration = durations.getOrNull(binding.spDuration.selectedItemPosition)?.minutes ?: 0

        if (station?.id == null || date.isBlank() || time == "Select time" || duration <= 0) {
            UiUtils.longToast(requireActivity(), "Please complete all booking details.")
            return
        }

        binding.btnConfirmBooking.isEnabled = false
        binding.btnConfirmBooking.text = "Booking..."

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = api.createReservation(
                    CreateReservationRequest(
                        stationId = station.id,
                        date = date,
                        startTime = time,
                        durationMinutes = duration
                    )
                )

                val reservation = response.body()?.data
                if (response.isSuccessful && reservation != null) {
                    UiUtils.toast(requireActivity(), "Booking successful")
                    loadBookingData()
                    openReservationCheckout(reservation)
                    clearForm(keepToast = true)
                } else {
                    UiUtils.longToast(requireActivity(), UiUtils.errorFrom(response))
                }
            } catch (e: Exception) {
                UiUtils.longToast(requireActivity(), ErrorUtils.CONNECTION_ERROR_MESSAGE)
            } finally {
                binding.btnConfirmBooking.isEnabled = true
                binding.btnConfirmBooking.text = "Confirm Booking"
            }
        }
    }

    private suspend fun openReservationCheckout(reservation: ReservationDto) {
        val payment = findPendingPayment("RESERVATION", reservation.id)
        if (payment?.id == null) {
            UiUtils.longToast(
                requireActivity(),
                "Booking created, but no pending payment was found. Check Transaction History."
            )
            return
        }

        startActivity(Intent(requireContext(), SandboxCheckoutActivity::class.java).putExtra("paymentId", payment.id))
    }

    private suspend fun findPendingPayment(type: String, referenceId: Long?): PaymentDto? {
        if (referenceId == null) return null
        val payments = api.myPayments().body()?.data.orEmpty()
        return payments.firstOrNull {
            it.type == type &&
                it.referenceId == referenceId &&
                it.status in setOf("PENDING", "INITIATED", "PROCESSING")
        }
    }

    private fun clearForm(keepToast: Boolean = false) {
        selectedStation = null
        binding.tvSelectedStation.text = "Selected station: None"
        binding.etDate.setText("")
        binding.spTime.setSelection(0)
        binding.spDuration.setSelection(0)
        updateBookingTotal()
        renderStations()
        if (!keepToast) UiUtils.toast(requireActivity(), "Booking form cleared")
    }

    private fun renderLatestReservation(reservation: ReservationDto?) {
        binding.tvLatestReservation.text = if (reservation == null) {
            "No reservations yet."
        } else {
            "Reservation #${reservation.id}\n" +
                "Station: ${reservation.station?.stationNo ?: "N/A"}\n" +
                "Date: ${DateTimeUtils.formatDate(reservation.date ?: reservation.reservationDate)} ${DateTimeUtils.formatTime(reservation.startTime)}\n" +
                "Duration: ${reservation.durationMinutes ?: 0} min\n" +
                "Status: ${reservation.status ?: "N/A"}"
        }
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        DatePickerDialog(
            requireContext(),
            { _, year, month, day ->
                binding.etDate.setText(DateTimeUtils.calendarDateIso(year, month, day))
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        ).apply {
            datePicker.minDate = Calendar.getInstance().timeInMillis
        }.show()
    }

    private fun updateBookingTotal() {
        val minutes = durations.getOrNull(binding.spDuration.selectedItemPosition)?.minutes ?: 0
        val total = (minutes / 60.0) * ratePerHour
        binding.tvBookingTotal.text = "Total: ${DateTimeUtils.formatCurrency(total)}"
    }

    private fun infoText(value: String): TextView = text(value, 14, R.color.bytezone_muted, false).apply {
        setPadding(0, dp(8), 0, dp(8))
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
