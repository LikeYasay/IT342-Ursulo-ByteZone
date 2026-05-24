package edu.cit.ursulo.bytezone.payments

import android.os.Bundle
import android.view.View
import android.widget.GridLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.databinding.ActivitySandboxCheckoutBinding
import edu.cit.ursulo.bytezone.shared.api.PaymentDto
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.utils.DateTimeUtils
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import edu.cit.ursulo.bytezone.shared.utils.UiUtils
import kotlinx.coroutines.launch

class SandboxCheckoutActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySandboxCheckoutBinding
    private lateinit var api: PaymentApiService
    private var paymentId: Long = -1L
    private var payment: PaymentDto? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySandboxCheckoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        api = RetrofitClient.create(this, PaymentApiService::class.java)
        paymentId = intent.getLongExtra("paymentId", -1L)

        binding.btnPaySuccess.setOnClickListener { submitResult("PAID") }
        binding.btnFailPayment.setOnClickListener { submitResult("FAILED") }
        binding.btnCancelPayment.setOnClickListener { submitResult("CANCELLED") }

        if (paymentId <= 0L) {
            UiUtils.longToast(this, "Missing payment ID.")
            finish()
        } else {
            startProcessing()
        }
    }

    private fun startProcessing() {
        setButtonsEnabled(false)
        lifecycleScope.launch {
            try {
                val response = api.startSandboxProcessing(paymentId)
                val body = response.body()?.data
                if (response.isSuccessful && body != null) {
                    payment = body
                    renderPayment(body)
                } else {
                    UiUtils.longToast(this@SandboxCheckoutActivity, UiUtils.errorFrom(response))
                    finish()
                }
            } catch (e: Exception) {
                UiUtils.longToast(this@SandboxCheckoutActivity, ErrorUtils.CONNECTION_ERROR_MESSAGE)
                finish()
            } finally {
                setButtonsEnabled(true)
            }
        }
    }

    private fun submitResult(status: String) {
        setButtonsEnabled(false)
        lifecycleScope.launch {
            try {
                val response = api.submitSandboxResult(
                    paymentId,
                    SandboxPaymentResultRequest(
                        status = status,
                        referenceNo = "BZ-SANDBOX-$paymentId"
                    )
                )
                val body = response.body()?.data
                if (response.isSuccessful && body != null) {
                    payment = body
                    renderPayment(body)
                    when (status) {
                        "PAID" -> UiUtils.toast(this@SandboxCheckoutActivity, "Payment successful")
                        "FAILED" -> UiUtils.longToast(this@SandboxCheckoutActivity, "Payment failed")
                        "CANCELLED" -> UiUtils.toast(this@SandboxCheckoutActivity, "Payment cancelled")
                    }
                    finish()
                } else {
                    UiUtils.longToast(this@SandboxCheckoutActivity, UiUtils.errorFrom(response))
                }
            } catch (e: Exception) {
                UiUtils.longToast(this@SandboxCheckoutActivity, ErrorUtils.CONNECTION_ERROR_MESSAGE)
            } finally {
                setButtonsEnabled(true)
            }
        }
    }

    private fun renderPayment(payment: PaymentDto) {
        binding.tvPaymentId.text = "Payment ID: #${payment.id ?: paymentId}"
        binding.tvPaymentType.text = "Type: ${payment.type ?: "N/A"}"
        binding.tvPaymentAmount.text = "Amount: ${DateTimeUtils.formatCurrency(payment.amount)}"
        binding.tvPaymentStatus.text = "Status: ${payment.status ?: "N/A"}"
        val reference = payment.referenceNo ?: "BZ-SANDBOX-${payment.id ?: paymentId}"
        binding.tvPaymentReference.text = "Reference: $reference"
        binding.tvQrReference.text = "Mock QR Sandbox - Reference: $reference"
        renderMockQr((payment.id ?: paymentId).toInt())
    }

    private fun renderMockQr(seed: Int) {
        val size = 15
        val cellSize = dp(10)
        binding.qrGrid.removeAllViews()

        for (row in 0 until size) {
            for (col in 0 until size) {
                val dark = isFinder(row, col) ||
                    ((row * 31 + col * 17 + seed) % 7 in 0..2 && !isFinderBorder(row, col))
                val cell = View(this).apply {
                    setBackgroundColor(
                        ContextCompat.getColor(
                            this@SandboxCheckoutActivity,
                            if (dark) R.color.black else R.color.white
                        )
                    )
                    layoutParams = GridLayout.LayoutParams(
                        GridLayout.spec(row),
                        GridLayout.spec(col)
                    ).apply {
                        width = cellSize
                        height = cellSize
                    }
                }
                binding.qrGrid.addView(cell)
            }
        }
    }

    private fun isFinder(row: Int, col: Int): Boolean {
        return finderBlock(row, col, 0, 0) ||
            finderBlock(row, col, 0, 10) ||
            finderBlock(row, col, 10, 0)
    }

    private fun isFinderBorder(row: Int, col: Int): Boolean {
        return finderArea(row, col, 0, 0) ||
            finderArea(row, col, 0, 10) ||
            finderArea(row, col, 10, 0)
    }

    private fun finderArea(row: Int, col: Int, top: Int, left: Int): Boolean {
        return row in top until top + 5 && col in left until left + 5
    }

    private fun finderBlock(row: Int, col: Int, top: Int, left: Int): Boolean {
        if (!finderArea(row, col, top, left)) return false
        val localRow = row - top
        val localCol = col - left
        val border = localRow == 0 || localRow == 4 || localCol == 0 || localCol == 4
        val center = localRow in 2..2 && localCol in 2..2
        return border || center
    }

    private fun setButtonsEnabled(enabled: Boolean) {
        binding.btnPaySuccess.isEnabled = enabled
        binding.btnFailPayment.isEnabled = enabled
        binding.btnCancelPayment.isEnabled = enabled
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}
