package com.example.DriveGuardAI.model;

import java.util.List;

import com.example.DriveGuardAI.Enum.VehiclesStatus;

import jakarta.persistence.*;



@Entity
@Table(name = "Vehicles")
public class Vehicles {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long vehicleId;
    private String model;
    @Column(name = "PlateNumber", nullable = false)
    private String plateNumber;

    @Column(name = "LicensePlate", nullable = false)
    private String licensePlate;
    @Enumerated(EnumType.STRING)
    @Column(name = "VehicleStatus", nullable = false)
    private VehiclesStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Drivers driver;


    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Trips> trips;


    @OneToMany(mappedBy = "vehicles", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Incidents> incidents;


    public Long getVehicleId() {
        return vehicleId;
    }


    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }


    public String getModel() {
        return model;
    }


    public void setModel(String model) {
        this.model = model;
    }


    public String getPlateNumber() {
        return plateNumber;
    }


    public void setPlateNumber(String plateNumber) {
        this.plateNumber = plateNumber;
    }


    public String getLicensePlate() {
        return licensePlate;
    }


    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }


    public VehiclesStatus getStatus() {
        return status;
    }


    public void setStatus(VehiclesStatus status) {
        this.status = status;
    }


    public Drivers getDriver() {
        return driver;
    }


    public void setDriver(Drivers driver) {
        this.driver = driver;
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
