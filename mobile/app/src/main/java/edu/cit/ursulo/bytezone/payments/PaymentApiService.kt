package edu.cit.ursulo.bytezone.payments

import edu.cit.ursulo.bytezone.shared.api.ApiResponse
import edu.cit.ursulo.bytezone.shared.api.PaymentDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path

interface PaymentApiService {
    @GET("api/payments/me")
    suspend fun myPayments(): Response<ApiResponse<List<PaymentDto>>>

    @PUT("api/payments/{paymentId}/sandbox/process")
    suspend fun startSandboxProcessing(@Path("paymentId") paymentId: Long): Response<ApiResponse<PaymentDto>>

    @PUT("api/payments/{paymentId}/sandbox/result")
    suspend fun submitSandboxResult(
        @Path("paymentId") paymentId: Long,
        @Body request: SandboxPaymentResultRequest
    ): Response<ApiResponse<PaymentDto>>
}
