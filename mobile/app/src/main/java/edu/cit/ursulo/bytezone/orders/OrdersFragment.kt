package edu.cit.ursulo.bytezone.orders

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.databinding.FragmentOrdersBinding
import edu.cit.ursulo.bytezone.payments.SandboxCheckoutActivity
import edu.cit.ursulo.bytezone.shared.api.PaymentDto
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.api.SnackDto
import edu.cit.ursulo.bytezone.shared.api.SnackOrderDto
import edu.cit.ursulo.bytezone.shared.api.StationDto
import edu.cit.ursulo.bytezone.shared.utils.DateTimeUtils
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import edu.cit.ursulo.bytezone.shared.utils.ImageLoader
import edu.cit.ursulo.bytezone.shared.utils.UiUtils
import kotlinx.coroutines.launch

class OrdersFragment : Fragment() {

    private var _binding: FragmentOrdersBinding? = null
    private val binding get() = _binding!!

    private lateinit var api: OrderApiService
    private var snacks: List<SnackDto> = emptyList()
    private var stations: List<StationDto> = emptyList()
    private val cart = linkedMapOf<Long, CartLine>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrdersBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        api = RetrofitClient.create(requireContext(), OrderApiService::class.java)

        binding.etSearchSnacks.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                renderSnacks()
            }
            override fun afterTextChanged(s: Editable?) = Unit
        })
        binding.btnConfirmOrder.setOnClickListener { confirmOrder() }
        binding.btnClearCart.setOnClickListener {
            cart.clear()
            renderCart()
            renderSnacks()
        }

        loadData()
    }

    override fun onDestroyView() {
        _binding = null
        super.onDestroyView()
    }

    private fun loadData() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                snacks = api.snacks().body()?.data.orEmpty()
                    .filter { it.available != false }
                stations = api.stations().body()?.data.orEmpty()
                val orders = api.myOrders().body()?.data.orEmpty()

                setupStations()
                renderSnacks()
                renderCart()
                renderLatestOrder(orders.firstOrNull())
            } catch (e: Exception) {
                UiUtils.longToast(requireActivity(), ErrorUtils.CONNECTION_ERROR_MESSAGE)
            }
        }
    }

    private fun setupStations() {
        val labels = mutableListOf("Select station")
        labels.addAll(stations.map { it.stationNo ?: "Station #${it.id}" })
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, labels)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spOrderStation.adapter = adapter
    }

    private fun renderSnacks() {
        binding.snacksContainer.removeAllViews()
        val query = binding.etSearchSnacks.text.toString().trim().lowercase()
        val visible = snacks.filter { snack ->
            query.isBlank() ||
                snack.name.orEmpty().lowercase().contains(query) ||
                snack.category.orEmpty().lowercase().contains(query)
        }

        if (visible.isEmpty()) {
            binding.snacksContainer.addView(text("No snacks found.", 14, R.color.bytezone_muted, false))
            return
        }

        visible.groupBy { it.category ?: "Recommended Offers" }
            .forEach { (category, items) ->
                binding.snacksContainer.addView(text(category, 18, R.color.white, true).apply {
                    setPadding(0, dp(8), 0, dp(10))
                })
                items.forEach { snack -> binding.snacksContainer.addView(snackCard(snack)) }
            }
    }

    private fun snackCard(snack: SnackDto): View {
        val snackId = snack.id ?: -1L
        val quantity = cart[snackId]?.quantity ?: 0
        val card = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            setBackgroundResource(if (quantity > 0) R.drawable.bg_card_selected else R.drawable.bg_card_subtle)
            setPadding(dp(12), dp(12), dp(12), dp(12))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(10) }
        }

        val image = ImageView(requireContext()).apply {
            setBackgroundResource(R.drawable.bg_card_disabled)
            scaleType = ImageView.ScaleType.CENTER_CROP
            layoutParams = LinearLayout.LayoutParams(dp(64), dp(64)).apply { marginEnd = dp(12) }
        }
        card.addView(image)
        if (!snack.imageUrl.isNullOrBlank()) {
            viewLifecycleOwner.lifecycleScope.launch {
                ImageLoader.load(image, snack.imageUrl)
            }
        }

        val info = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        info.addView(text(snack.name ?: "Snack", 16, R.color.white, true))
        info.addView(text(DateTimeUtils.formatCurrency(snack.price), 14, R.color.bytezone_cyan, true).apply {
            setPadding(0, dp(4), 0, 0)
        })
        info.addView(text(snack.category ?: "Snack", 12, R.color.bytezone_muted, false).apply {
            setPadding(0, dp(2), 0, 0)
        })
        card.addView(info)

        val controls = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
        }

        controls.addView(smallButton("-") {
            removeFromCart(snack)
        })
        controls.addView(text(quantity.toString(), 16, R.color.bytezone_cyan, true).apply {
            gravity = android.view.Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(dp(34), LinearLayout.LayoutParams.WRAP_CONTENT)
        })
        controls.addView(smallButton("+") {
            addToCart(snack)
        })
        card.addView(controls)

        return card
    }

    private fun addToCart(snack: SnackDto) {
        val id = snack.id ?: return
        val existing = cart[id]
        if (existing == null) {
            cart[id] = CartLine(
                snackId = id,
                name = snack.name ?: "Snack",
                price = snack.price ?: 0.0,
                imageUrl = snack.imageUrl,
                category = snack.category,
                quantity = 1
            )
        } else {
            existing.quantity += 1
        }
        renderCart()
        renderSnacks()
    }

    private fun removeFromCart(snack: SnackDto) {
        val id = snack.id ?: return
        val existing = cart[id] ?: return
        existing.quantity -= 1
        if (existing.quantity <= 0) {
            cart.remove(id)
        }
        renderCart()
        renderSnacks()
    }

    private fun renderCart() {
        binding.cartItemsContainer.removeAllViews()
        if (cart.isEmpty()) {
            binding.cartItemsContainer.addView(text("No snacks added yet.", 14, R.color.bytezone_muted, false))
        } else {
            cart.values.forEach { item ->
                binding.cartItemsContainer.addView(cartRow(item))
            }
        }

        val total = cart.values.sumOf { it.price * it.quantity }
        binding.tvCartTotal.text = "Total: ${DateTimeUtils.formatCurrency(total)}"
    }

    private fun cartRow(item: CartLine): View {
        val row = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            setPadding(0, dp(8), 0, dp(8))
        }

        row.addView(text("${item.name} x${item.quantity}", 14, R.color.white, true), LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        row.addView(text(DateTimeUtils.formatCurrency(item.price * item.quantity), 14, R.color.bytezone_cyan, true))
        return row
    }

    private fun confirmOrder() {
        val stationIndex = binding.spOrderStation.selectedItemPosition - 1
        val station = stations.getOrNull(stationIndex)

        if (station?.id == null) {
            UiUtils.longToast(requireActivity(), "Please select a station first.")
            return
        }
        if (cart.isEmpty()) {
            UiUtils.longToast(requireActivity(), "Please add at least one snack.")
            return
        }

        binding.btnConfirmOrder.isEnabled = false
        binding.btnConfirmOrder.text = "Creating order..."

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val request = CreateOrderRequest(
                    stationId = station.id,
                    items = cart.values.map { OrderItemRequest(snackId = it.snackId, qty = it.quantity) }
                )
                val response = api.createOrder(request)
                val order = response.body()?.data

                if (response.isSuccessful && order != null) {
                    UiUtils.toast(requireActivity(), "Order created")
                    cart.clear()
                    loadData()
                    openOrderCheckout(order)
                } else {
                    UiUtils.longToast(requireActivity(), UiUtils.errorFrom(response))
                }
            } catch (e: Exception) {
                UiUtils.longToast(requireActivity(), ErrorUtils.CONNECTION_ERROR_MESSAGE)
            } finally {
                binding.btnConfirmOrder.isEnabled = true
                binding.btnConfirmOrder.text = "Confirm Order"
            }
        }
    }

    private suspend fun openOrderCheckout(order: SnackOrderDto) {
        val payment = findPendingPayment("SNACK_ORDER", order.id)
        if (payment?.id == null) {
            UiUtils.longToast(
                requireActivity(),
                "Order created, but no pending payment was found. Check Transaction History."
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

    private fun renderLatestOrder(order: SnackOrderDto?) {
        binding.tvLatestOrder.text = if (order == null) {
            "No orders yet."
        } else {
            "Order #${order.id}\n" +
                "Station: ${order.station?.stationNo ?: "N/A"}\n" +
                "Status: ${order.status ?: "N/A"}\n" +
                "Total: ${DateTimeUtils.formatCurrency(order.total)}\n" +
                "Created: ${DateTimeUtils.formatDateTime(order.createdAt)}"
        }
    }

    private fun smallButton(label: String, onClick: () -> Unit): Button {
        return Button(requireContext()).apply {
            text = label
            textSize = 16f
            setTextColor(ContextCompat.getColor(requireContext(), R.color.white))
            setBackgroundResource(R.drawable.bg_auth_button)
            minWidth = 0
            minHeight = 0
            setPadding(0, 0, 0, 0)
            layoutParams = LinearLayout.LayoutParams(dp(38), dp(38))
            setOnClickListener { onClick() }
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
