package edu.cit.ursulo.bytezone.auth;

import java.time.LocalDateTime;

public class MeResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Integer tournamentWins;
    private Double totalHoursPlayed;
    private Integer totalHoursPlayedMinutes;
    private String profileImageUrl;
    private LocalDateTime createdAt;

    public MeResponse() {
    }

    public MeResponse(Long id,
                      String fullName,
                      String email,
                      String role,
                      Integer tournamentWins,
                      Double totalHoursPlayed,
                      Integer totalHoursPlayedMinutes,
                      String profileImageUrl,
                      LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.tournamentWins = tournamentWins;
        this.totalHoursPlayed = totalHoursPlayed;
        this.totalHoursPlayedMinutes = totalHoursPlayedMinutes;
        this.profileImageUrl = profileImageUrl;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public Integer getTournamentWins() {
        return tournamentWins;
    }

    public Double getTotalHoursPlayed() {
        return totalHoursPlayed;
    }

    public Integer getTotalHoursPlayedMinutes() {
        return totalHoursPlayedMinutes;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setTournamentWins(Integer tournamentWins) {
        this.tournamentWins = tournamentWins;
    }

    public void setTotalHoursPlayed(Double totalHoursPlayed) {
        this.totalHoursPlayed = totalHoursPlayed;
    }

    public void setTotalHoursPlayedMinutes(Integer totalHoursPlayedMinutes) {
        this.totalHoursPlayedMinutes = totalHoursPlayedMinutes;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}