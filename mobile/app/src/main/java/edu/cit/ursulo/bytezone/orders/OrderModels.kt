package edu.cit.ursulo.bytezone.orders

data class CreateOrderRequest(
    val stationId: Long,
    val items: List<OrderItemRequest>,
    val paymentMethod: String = "SANDBOX"
)

data class OrderItemRequest(
    val snackId: Long,
    val qty: Int
)

data class CartLine(
    val snackId: Long,
    val name: String,
    val price: Double,
    val imageUrl: String?,
    val category: String?,
    var quantity: Int
)
