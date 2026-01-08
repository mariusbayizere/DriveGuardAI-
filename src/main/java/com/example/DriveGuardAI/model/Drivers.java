package com.example.DriveGuardAI.model;
import java.util.Date;
import java.util.List;

import com.example.DriveGuardAI.Enum.DriverStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;


@Entity
@Table(name = "Drivers")
public class Drivers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "LicenseNumber", nullable = false, unique = true)
    private String licenseNumber;
    @Column(name = "HireDate", nullable = false)
    private Date hireDate;
    @Column(name = "SafetyScore", nullable = false)
    private Byte safetyScore;

    @Column(name = "DriverStatus", nullable = false)
    private DriverStatus status;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    // @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Users user;


    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore 
    private List<Vehicles> vehicles = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Trips> trips = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Incidents> incidents = new java.util.ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public Date getHireDate() {
        return hireDate;
    }

    public void setHireDate(Date hireDate) {
        this.hireDate = hireDate;
    }

    public Byte getSafetyScore() {
        return safetyScore;
    }

    public void setSafetyScore(Byte safetyScore) {
        this.safetyScore = safetyScore;
    }

    public DriverStatus getStatus() {
        return status;
    }

    public void setStatus(DriverStatus status) {
        this.status = status;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public List<Vehicles> getVehicles() {
        return vehicles;
    }

    public void setVehicles(List<Vehicles> vehicles) {
        this.vehicles = vehicles;
    }

    public List<Trips> getTrips() {
        return trips;
    }

    public void setTrips(List<Trips> trips) {
        this.trips = trips;
    }

    public List<Incidents> getIncidents() {
        return incidents;
    }

    public void setIncidents(List<Incidents> incidents) {
        this.incidents = incidents;
    }

}
