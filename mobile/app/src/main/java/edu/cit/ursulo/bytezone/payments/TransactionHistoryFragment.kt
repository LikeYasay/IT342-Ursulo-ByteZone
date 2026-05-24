package edu.cit.ursulo.bytezone.payments

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.databinding.FragmentTransactionsBinding
import edu.cit.ursulo.bytezone.shared.api.PaymentDto
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.utils.DateTimeUtils
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import edu.cit.ursulo.bytezone.shared.utils.UiUtils
import kotlinx.coroutines.launch

class TransactionHistoryFragment : Fragment() {

    private var _binding: FragmentTransactionsBinding? = null
    private val binding get() = _binding!!

    private lateinit var api: PaymentApiService
    private var payments: List<PaymentDto> = emptyList()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTransactionsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        api = RetrofitClient.create(requireContext(), PaymentApiService::class.java)
        binding.btnRefreshPayments.setOnClickListener { loadPayments() }
        binding.etSearchPayments.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = renderPayments()
            override fun afterTextChanged(s: Editable?) = Unit
        })
        loadPayments()
    }

    override fun onResume() {
        super.onResume()
        if (_binding != null && ::api.isInitialized) loadPayments()
    }

    override fun onDestroyView() {
        _binding = null
        super.onDestroyView()
    }

    private fun loadPayments() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                payments = api.myPayments().body()?.data.orEmpty()
                renderPayments()
            } catch (e: Exception) {
                UiUtils.longToast(requireActivity(), ErrorUtils.CONNECTION_ERROR_MESSAGE)
            }
        }
    }

    private fun renderPayments() {
        binding.paymentsContainer.removeAllViews()
        val query = binding.etSearchPayments.text.toString().trim().lowercase()
        val visible = payments.filter { payment ->
            query.isBlank() ||
                payment.id.toString().contains(query) ||
                payment.type.orEmpty().lowercase().contains(query) ||
                payment.status.orEmpty().lowercase().contains(query) ||
                payment.referenceNo.orEmpty().lowercase().contains(query) ||
                payment.amount.toString().contains(query)
        }

        if (visible.isEmpty()) {
            binding.paymentsContainer.addView(text("No transaction records found.", 14, R.color.bytezone_muted, false))
            return
        }

        visible.forEach { payment ->
            binding.paymentsContainer.addView(paymentCard(payment))
        }
    }

    private fun paymentCard(payment: PaymentDto): View {
        val card = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundResource(R.drawable.bg_card)
            setPadding(dp(16), dp(14), dp(16), dp(14))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(12) }
        }

        val header = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
        }
        header.addView(text("#${payment.id ?: "N/A"} ${payment.type ?: "PAYMENT"}", 16, R.color.white, true), LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        val status = text(payment.status ?: "N/A", 13, R.color.bytezone_cyan, true)
        UiUtils.applyStatusColor(status, payment.status)
        status.setBackgroundResource(R.drawable.bg_status_pill)
        status.setPadding(dp(10), dp(6), dp(10), dp(6))
        header.addView(status)
        card.addView(header)

        card.addView(text("Amount: ${DateTimeUtils.formatCurrency(payment.amount)}", 15, R.color.bytezone_cyan, true).apply {
            setPadding(0, dp(10), 0, 0)
        })
        card.addView(text("Reference: ${payment.referenceNo ?: "N/A"}", 13, R.color.bytezone_muted, false).apply {
            setPadding(0, dp(4), 0, 0)
        })
        card.addView(text("Method: ${payment.method ?: "N/A"}", 13, R.color.bytezone_muted, false).apply {
            setPadding(0, dp(4), 0, 0)
        })
        card.addView(text("Created: ${DateTimeUtils.formatDateTime(payment.createdAt)}", 13, R.color.bytezone_muted, false).apply {
            setPadding(0, dp(4), 0, 0)
        })
        card.addView(text("Paid: ${DateTimeUtils.formatDateTime(payment.paidAt)}", 13, R.color.bytezone_muted, false).apply {
            setPadding(0, dp(4), 0, 0)
        })

        if (payment.status in setOf("PENDING", "INITIATED", "PROCESSING") && payment.id != null) {
            val payButton = Button(requireContext()).apply {
                text = "Open Sandbox Checkout"
                textSize = 14f
                setTextColor(ContextCompat.getColor(requireContext(), R.color.white))
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                setBackgroundResource(R.drawable.bg_auth_button)
                isAllCaps = false
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    dp(50)
                ).apply { topMargin = dp(12) }
                setOnClickListener {
                    startActivity(
                        Intent(requireContext(), SandboxCheckoutActivity::class.java)
                            .putExtra("paymentId", payment.id)
                    )
                }
            }
            card.addView(payButton)
        }

        return card
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
