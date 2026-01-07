package com.example.DriveGuardAI.model;

import java.util.List;

import com.example.DriveGuardAI.Enum.*;

import jakarta.persistence.*;

@Entity
@Table(name = "Incidents")
public class Incidents {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long incident_id;
    @Enumerated(EnumType.STRING)
    private IncidentTypes incident_type;
    private String description;
    @Enumerated(EnumType.STRING)
    private Severity  severity;
    private String timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Drivers driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trips trip;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alters> alters;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicles vehicles;

    public Long getIncident_id() {
        return incident_id;
    }

    public void setIncident_id(Long incident_id) {
        this.incident_id = incident_id;
    }

    public IncidentTypes getIncident_type() {
        return incident_type;
    }

    public void setIncident_type(IncidentTypes incident_type) {
        this.incident_type = incident_type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public Drivers getDriver() {
        return driver;
    }

    public void setDriver(Drivers driver) {
        this.driver = driver;
    }

    public Trips getTrip() {
        return trip;
    }

    public void setTrip(Trips trip) {
        this.trip = trip;
    }

    public List<Alters> getAlters() {
        return alters;
    }

    public void setAlters(List<Alters> alters) {
        this.alters = alters;
    }

    // public Vehicles getVehicles() {
    //     return vehicles;
    // }

    // public void setVehicles(Vehicles vehicles) {
    //     this.vehicles = vehicles;
    // }


         public Vehicles getVehicle() {
         return vehicles;
     }

     public void setVehicle(Vehicles vehicle) {
         this.vehicles = vehicle;
     }
    
}
