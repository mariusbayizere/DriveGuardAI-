package com.example.DriveGuardAI.model;
import com.example.DriveGuardAI.enums.Alerts_Status;

import jakarta.persistence.*;

@Entity
@Table(name = "Alterts")
public class Alters {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String message;
    private String sentAt;
    private Alerts_Status status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
}