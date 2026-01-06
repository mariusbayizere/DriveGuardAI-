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

}
