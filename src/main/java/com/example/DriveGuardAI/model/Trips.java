package com.example.DriveGuardAI.model;

import java.util.List;

import com.example.DriveGuardAI.Enum.Trips_Status;

import jakarta.persistence.*;

@Entity
@Table(name = "Trips")
public class Trips {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tripId;
    private String startTime;
    private String endTime;
    private Trips_Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Drivers driver;


    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Incidents> incidents;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicles vehicle;


    public Long getTripId() {
        return tripId;
    }


    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }


    public String getStartTime() {
        return startTime;
    }


    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }


    public String getEndTime() {
        return endTime;
    }


    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }


    public Trips_Status getStatus() {
        return status;
    }


    public void setStatus(Trips_Status status) {
        this.status = status;
    }


    public Drivers getDriver() {
        return driver;
    }


    public void setDriver(Drivers driver) {
        this.driver = driver;
    }


    public List<Incidents> getIncidents() {
        return incidents;
    }


    public void setIncidents(List<Incidents> incidents) {
        this.incidents = incidents;
    }


    public Vehicles getVehicle() {
        return vehicle;
    }


    public void setVehicle(Vehicles vehicle) {
        this.vehicle = vehicle;
    }



    
}
