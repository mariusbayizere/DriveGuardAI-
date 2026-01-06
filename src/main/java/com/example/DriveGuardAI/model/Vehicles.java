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
}
