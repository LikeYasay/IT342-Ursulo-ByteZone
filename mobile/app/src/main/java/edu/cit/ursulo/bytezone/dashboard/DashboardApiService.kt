package edu.cit.ursulo.bytezone.dashboard

import edu.cit.ursulo.bytezone.shared.api.AnnouncementDto
import edu.cit.ursulo.bytezone.shared.api.ApiResponse
import edu.cit.ursulo.bytezone.shared.api.CafeSessionDto
import edu.cit.ursulo.bytezone.shared.api.GamingHighlightDto
import edu.cit.ursulo.bytezone.shared.api.NotificationDto
import edu.cit.ursulo.bytezone.shared.api.PaymentDto
import edu.cit.ursulo.bytezone.shared.api.ReservationDto
import edu.cit.ursulo.bytezone.shared.api.SnackOrderDto
import edu.cit.ursulo.bytezone.shared.api.UserDto
import retrofit2.Response
import retrofit2.http.GET

interface DashboardApiService {
    @GET("api/me")
    suspend fun me(): Response<ApiResponse<UserDto>>

    @GET("api/reservations/me")
    suspend fun myReservations(): Response<ApiResponse<List<ReservationDto>>>

    @GET("api/orders/me")
    suspend fun myOrders(): Response<ApiResponse<List<SnackOrderDto>>>

    @GET("api/payments/me")
    suspend fun myPayments(): Response<ApiResponse<List<PaymentDto>>>

    @GET("api/announcements")
    suspend fun announcements(): Response<ApiResponse<List<AnnouncementDto>>>

    @GET("api/sessions/me/active")
    suspend fun myActiveSession(): Response<ApiResponse<CafeSessionDto>>

    @GET("api/public/gaming-highlights")
    suspend fun gamingHighlights(): Response<ApiResponse<List<GamingHighlightDto>>>

    @GET("api/notifications/me/unread-count")
    suspend fun unreadCount(): Response<ApiResponse<Long>>
}
