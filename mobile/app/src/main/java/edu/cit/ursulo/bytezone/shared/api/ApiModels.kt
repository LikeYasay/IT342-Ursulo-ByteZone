package edu.cit.ursulo.bytezone.shared.api

data class ApiResponse<T>(
    val success: Boolean? = null,
    val data: T? = null,
    val message: String? = null
)

data class UserDto(
    val id: Long? = null,
    val fullName: String? = null,
    val email: String? = null,
    val role: String? = null,
    val tournamentWins: Int? = null,
    val totalHoursPlayed: Double? = null,
    val totalHoursPlayedMinutes: Int? = null,
    val profileImageUrl: String? = null,
    val createdAt: String? = null
)

data class StationDto(
    val id: Long? = null,
    val stationNo: String? = null,
    val status: String? = null
)

data class ReservationDto(
    val id: Long? = null,
    val station: StationDto? = null,
    val date: String? = null,
    val reservationDate: String? = null,
    val startTime: String? = null,
    val durationMinutes: Int? = null,
    val durationHours: Double? = null,
    val status: String? = null,
    val createdAt: String? = null
)

data class CafeSessionDto(
    val id: Long? = null,
    val station: StationDto? = null,
    val user: UserDto? = null,
    val startTime: String? = null,
    val endTime: String? = null,
    val status: String? = null,
    val createdAt: String? = null
)

data class PaymentDto(
    val id: Long? = null,
    val type: String? = null,
    val referenceId: Long? = null,
    val amount: Double? = null,
    val status: String? = null,
    val method: String? = null,
    val referenceNo: String? = null,
    val createdAt: String? = null,
    val paidAt: String? = null
)

data class SnackDto(
    val id: Long? = null,
    val name: String? = null,
    val price: Double? = null,
    val available: Boolean? = null,
    val imageUrl: String? = null,
    val category: String? = null
)

data class OrderItemDto(
    val id: Long? = null,
    val snack: SnackDto? = null,
    val quantity: Int? = null,
    val price: Double? = null
)

data class SnackOrderDto(
    val id: Long? = null,
    val station: StationDto? = null,
    val status: String? = null,
    val paymentMethod: String? = null,
    val total: Double? = null,
    val createdAt: String? = null,
    val items: List<OrderItemDto>? = null
)

data class NotificationDto(
    val id: Long? = null,
    val title: String? = null,
    val message: String? = null,
    val type: String? = null,
    val readStatus: Boolean? = null,
    val createdAt: String? = null
)

data class AnnouncementDto(
    val id: Long? = null,
    val title: String? = null,
    val description: String? = null,
    val createdBy: String? = null,
    val createdAt: String? = null
)

data class GamingHighlightDto(
    val name: String? = null,
    val background: String? = null,
    val rating: Double? = null,
    val released: String? = null
)
