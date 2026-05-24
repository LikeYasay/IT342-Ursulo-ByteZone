package edu.cit.ursulo.bytezone.payments

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
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
        binding.tvPaymentReference.text = "Reference: ${payment.referenceNo ?: "BZ-SANDBOX-${payment.id ?: paymentId}"}"
        binding.tvQrPlaceholder.text = "BYTEZONE\nSANDBOX\n#${payment.id ?: paymentId}"
    }

    private fun setButtonsEnabled(enabled: Boolean) {
        binding.btnPaySuccess.isEnabled = enabled
        binding.btnFailPayment.isEnabled = enabled
        binding.btnCancelPayment.isEnabled = enabled
    }
}
