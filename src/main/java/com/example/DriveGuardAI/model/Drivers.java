package com.example.DriveGuardAI.model;
import com.example.DriveGuardAI.Enum.DriverStatus;

import jakarta.persistence.*;

import java.util.Date;
import java.util.List;

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
    private Users user;


    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vehicles> vehicles;

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Trips> trips;

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Incidents> incidents;

}
