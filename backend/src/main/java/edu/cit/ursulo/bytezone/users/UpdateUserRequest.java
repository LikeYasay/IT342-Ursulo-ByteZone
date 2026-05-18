package edu.cit.ursulo.bytezone.users;

import jakarta.validation.constraints.Min;

public class UpdateUserRequest {

    private String fullName;
    private Role role;

    @Min(value = 0, message = "Tournament wins cannot be negative")
    private Integer tournamentWins;

    public String getFullName() {
        return fullName;
    }

    public Role getRole() {
        return role;
    }

    public Integer getTournamentWins() {
        return tournamentWins;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setTournamentWins(Integer tournamentWins) {
        this.tournamentWins = tournamentWins;
    }
}