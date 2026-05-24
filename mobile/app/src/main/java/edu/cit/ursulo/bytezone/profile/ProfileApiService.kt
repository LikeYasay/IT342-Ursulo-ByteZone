package edu.cit.ursulo.bytezone.profile

import edu.cit.ursulo.bytezone.auth.ProfileUpdateRequest
import edu.cit.ursulo.bytezone.shared.api.ApiResponse
import edu.cit.ursulo.bytezone.shared.api.UserDto
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PUT
import retrofit2.http.Part

interface ProfileApiService {
    @GET("api/me")
    suspend fun me(): Response<ApiResponse<UserDto>>

    @PUT("api/user/me")
    suspend fun updateProfile(@Body request: ProfileUpdateRequest): Response<ApiResponse<UserDto>>

    @Multipart
    @PUT("api/user/me/profile-image")
    suspend fun uploadProfileImage(@Part file: MultipartBody.Part): Response<ApiResponse<UserDto>>
}
