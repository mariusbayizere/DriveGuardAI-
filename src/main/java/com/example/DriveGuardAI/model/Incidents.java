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
}
