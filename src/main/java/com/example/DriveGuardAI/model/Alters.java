package com.example.DriveGuardAI.model;

import com.example.DriveGuardAI.Enum.*;

import jakarta.persistence.*;

@Entity
@Table(name = "Alterts")
public class Alters {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AlertID", nullable = false, unique = true)
    private Long id;

    @Column(name = "Message", nullable = false)
    private String message;

    @Column(name = "SentAt", nullable = false)
    private String  sentAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private Alerts_Status status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incidents incident;


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getMessage() {
        return message;
    }


    public void setMessage(String message) {
        this.message = message;
    }


    public String getSentAt() {
        return sentAt;
    }


    public void setSentAt(String sentAt) {
        this.sentAt = sentAt;
    }


    public Alerts_Status getStatus() {
        return status;
    }


    public void setStatus(Alerts_Status status) {
        this.status = status;
    }


    public Users getUser() {
        return user;
    }


    public void setUser(Users user) {
        this.user = user;
    }


  

    
}







