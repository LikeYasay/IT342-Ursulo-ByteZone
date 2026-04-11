package edu.cit.ursulo.bytezone.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "stations")
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "station_no", nullable = false, unique = true)
    private String stationNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StationStatus status;

    public Station() {
    }

    public Station(String stationNo, StationStatus status) {
        this.stationNo = stationNo;
        this.status = status;
    }

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = StationStatus.AVAILABLE;
        }
    }

    public Long getId() {
        return id;
    }

    public String getStationNo() {
        return stationNo;
    }

    public StationStatus getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStationNo(String stationNo) {
        this.stationNo = stationNo;
    }

    public void setStatus(StationStatus status) {
        this.status = status;
    }
}