package edu.cit.ursulo.bytezone.orders

import edu.cit.ursulo.bytezone.shared.api.ApiResponse
import edu.cit.ursulo.bytezone.shared.api.PaymentDto
import edu.cit.ursulo.bytezone.shared.api.SnackDto
import edu.cit.ursulo.bytezone.shared.api.SnackOrderDto
import edu.cit.ursulo.bytezone.shared.api.StationDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface OrderApiService {
    @GET("api/snacks")
    suspend fun snacks(): Response<ApiResponse<List<SnackDto>>>

    @GET("api/stations")
    suspend fun stations(): Response<ApiResponse<List<StationDto>>>

    @GET("api/orders/me")
    suspend fun myOrders(): Response<ApiResponse<List<SnackOrderDto>>>

    @GET("api/payments/me")
    suspend fun myPayments(): Response<ApiResponse<List<PaymentDto>>>

    @POST("api/orders")
    suspend fun createOrder(@Body request: CreateOrderRequest): Response<ApiResponse<SnackOrderDto>>
}
