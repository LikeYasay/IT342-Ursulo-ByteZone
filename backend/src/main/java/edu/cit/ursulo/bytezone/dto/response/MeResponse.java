package edu.cit.ursulo.bytezone.dto.response;

public class MeResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Integer tournamentWins;

    public MeResponse() {
    }

    public MeResponse(Long id, String fullName, String email, String role, Integer tournamentWins) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.tournamentWins = tournamentWins;
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
}