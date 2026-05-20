package edu.cit.ursulo.bytezone.users;

public class UserInsightsResponse {

    private double totalHoursPlayed;
    private int tournamentWins;
    private String lastPlayed;   // ISO date string or null
    private String favoriteGame; // station name most used, or null
    private long totalOrders;
    private long totalPayments;

    public UserInsightsResponse() {
    }

    public UserInsightsResponse(double totalHoursPlayed, int tournamentWins,
                                String lastPlayed, String favoriteGame,
                                long totalOrders, long totalPayments) {
        this.totalHoursPlayed = totalHoursPlayed;
        this.tournamentWins = tournamentWins;
        this.lastPlayed = lastPlayed;
        this.favoriteGame = favoriteGame;
        this.totalOrders = totalOrders;
        this.totalPayments = totalPayments;
    }

    public double getTotalHoursPlayed() { return totalHoursPlayed; }
    public int getTournamentWins() { return tournamentWins; }
    public String getLastPlayed() { return lastPlayed; }
    public String getFavoriteGame() { return favoriteGame; }
    public long getTotalOrders() { return totalOrders; }
    public long getTotalPayments() { return totalPayments; }

    public void setTotalHoursPlayed(double totalHoursPlayed) { this.totalHoursPlayed = totalHoursPlayed; }
    public void setTournamentWins(int tournamentWins) { this.tournamentWins = tournamentWins; }
    public void setLastPlayed(String lastPlayed) { this.lastPlayed = lastPlayed; }
    public void setFavoriteGame(String favoriteGame) { this.favoriteGame = favoriteGame; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public void setTotalPayments(long totalPayments) { this.totalPayments = totalPayments; }
}
