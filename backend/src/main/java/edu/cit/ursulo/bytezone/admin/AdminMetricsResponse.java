package edu.cit.ursulo.bytezone.admin;

public class AdminMetricsResponse {

    private long totalUsers;
    private long totalOrders;
    private long activeSessions;
    private long pendingPayments;
    private long paidPayments;
    private long totalPayments;

    public AdminMetricsResponse(long totalUsers,
                                long totalOrders,
                                long activeSessions,
                                long pendingPayments,
                                long paidPayments,
                                long totalPayments) {
        this.totalUsers = totalUsers;
        this.totalOrders = totalOrders;
        this.activeSessions = activeSessions;
        this.pendingPayments = pendingPayments;
        this.paidPayments = paidPayments;
        this.totalPayments = totalPayments;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public long getActiveSessions() {
        return activeSessions;
    }

    public long getPendingPayments() {
        return pendingPayments;
    }

    public long getPaidPayments() {
        return paidPayments;
    }

    public long getTotalPayments() {
        return totalPayments;
    }
}