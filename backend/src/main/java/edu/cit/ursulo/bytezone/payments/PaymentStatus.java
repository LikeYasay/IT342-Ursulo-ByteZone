package edu.cit.ursulo.bytezone.payments;

public enum PaymentStatus {
    INITIATED,
    PROCESSING,
    PENDING,
    PAID,
    FAILED,
    CANCELLED,
    REFUNDED
}