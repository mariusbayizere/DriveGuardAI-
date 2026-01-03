package com.example.DriveGuardAI.model;

public class Alters {

    private Long id;
    private String alterType;
    private String alterDescription;
    private String alterDate;
    private String driverId;
    private String vehicleId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAlterType() {
        return alterType;
    }

    public void setAlterType(String alterType) {
        this.alterType = alterType;
    }

    public String getAlterDescription() {
        return alterDescription;
    }

    public void setAlterDescription(String alterDescription) {
        this.alterDescription = alterDescription;
    }

    public String getAlterDate() {
        return alterDate;
    }

    public void setAlterDate(String alterDate) {
        this.alterDate = alterDate;
    }

    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }
}