package edu.cit.ursulo.bytezone.booking

import edu.cit.ursulo.bytezone.shared.api.ApiResponse
import edu.cit.ursulo.bytezone.shared.api.PaymentDto
import edu.cit.ursulo.bytezone.shared.api.ReservationDto
import edu.cit.ursulo.bytezone.shared.api.StationDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface BookingApiService {
    @GET("api/stations")
    suspend fun stations(): Response<ApiResponse<List<StationDto>>>

    @GET("api/reservations/me")
    suspend fun myReservations(): Response<ApiResponse<List<ReservationDto>>>

    @GET("api/payments/me")
    suspend fun myPayments(): Response<ApiResponse<List<PaymentDto>>>

    @POST("api/reservations")
    suspend fun createReservation(@Body request: CreateReservationRequest): Response<ApiResponse<ReservationDto>>
}
