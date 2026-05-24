package edu.cit.ursulo.bytezone.notifications

import edu.cit.ursulo.bytezone.shared.api.ApiResponse
import edu.cit.ursulo.bytezone.shared.api.NotificationDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path

interface NotificationApiService {
    @GET("api/notifications/me")
    suspend fun myNotifications(): Response<ApiResponse<List<NotificationDto>>>

    @GET("api/notifications/me/unread-count")
    suspend fun unreadCount(): Response<ApiResponse<Long>>

    @PUT("api/notifications/{notificationId}/read")
    suspend fun markAsRead(@Path("notificationId") notificationId: Long): Response<ApiResponse<NotificationDto>>
}
