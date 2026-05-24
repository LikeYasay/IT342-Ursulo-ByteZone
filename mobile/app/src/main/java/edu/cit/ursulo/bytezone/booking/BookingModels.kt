package edu.cit.ursulo.bytezone.booking

data class CreateReservationRequest(
    val stationId: Long,
    val date: String,
    val startTime: String,
    val durationMinutes: Int
)

data class DurationOption(
    val label: String,
    val minutes: Int
)
