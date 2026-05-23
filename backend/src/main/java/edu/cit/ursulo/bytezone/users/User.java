package edu.cit.ursulo.bytezone.users;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "tournament_wins", nullable = false)
    private Integer tournamentWins = 0;

    @Column(name = "total_hours_played_minutes", nullable = false)
    private Integer totalHoursPlayedMinutes = 0;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public User() {
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.role == null) {
            this.role = Role.USER;
        }

        if (this.tournamentWins == null) {
            this.tournamentWins = 0;
        }

        if (this.totalHoursPlayedMinutes == null) {
            this.totalHoursPlayedMinutes = 0;
        }
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

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }

    public Integer getTournamentWins() {
        return tournamentWins;
    }

    public Integer getTotalHoursPlayedMinutes() {
        return totalHoursPlayedMinutes;
    }

    public Double getTotalHoursPlayed() {
        if (totalHoursPlayedMinutes == null) {
            return 0.0;
        }

        return Math.round((totalHoursPlayedMinutes / 60.0) * 100.0) / 100.0;
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

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setTournamentWins(Integer tournamentWins) {
        this.tournamentWins = tournamentWins;
    }

    public void setTotalHoursPlayedMinutes(Integer totalHoursPlayedMinutes) {
        this.totalHoursPlayedMinutes = totalHoursPlayedMinutes;
    }

    public void addPlayedMinutes(int minutes) {
        if (minutes <= 0) {
            return;
        }

        if (this.totalHoursPlayedMinutes == null) {
            this.totalHoursPlayedMinutes = 0;
        }

        this.totalHoursPlayedMinutes += minutes;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}