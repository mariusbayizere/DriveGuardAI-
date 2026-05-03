package com.example.DriveGuardAI.dto;

import com.example.DriveGuardAI.Enum.IncidentTypes;
import com.example.DriveGuardAI.Enum.Severity;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for receiving violation data from Python AI service
 * Save as: ~/DriveGuardAI-/src/main/java/com/example/DriveGuardAI/dto/ViolationDTO.java
 */
public class ViolationDTO {
    
    @NotNull(message = "Driver ID is required")
    private Long driver_id;
    
    @NotNull(message = "Vehicle ID is required")
    private Long vehicle_id;
    
    @NotNull(message = "Trip ID is required")
    private Long trip_id;
    
    @NotNull(message = "Incident type is required")
    private IncidentTypes incident_type;
    
    @NotNull(message = "Severity is required")
    private Severity severity;
    
    private String description;
    
    @NotNull(message = "Timestamp is required")
    private String timestamp;
    
    private String screenshot;  // Optional: path to screenshot
    
    // Constructors
    public ViolationDTO() {
    }
    
    public ViolationDTO(Long driver_id, Long vehicle_id, Long trip_id, 
                       IncidentTypes incident_type, Severity severity, 
                       String description, String timestamp, String screenshot) {
        this.driver_id = driver_id;
        this.vehicle_id = vehicle_id;
        this.trip_id = trip_id;
        this.incident_type = incident_type;
        this.severity = severity;
        this.description = description;
        this.timestamp = timestamp;
        this.screenshot = screenshot;
    }
    
    // Getters and Setters
    public Long getDriver_id() {
        return driver_id;
    }
    
    public void setDriver_id(Long driver_id) {
        this.driver_id = driver_id;
    }
    
    public Long getVehicle_id() {
        return vehicle_id;
    }
    
    public void setVehicle_id(Long vehicle_id) {
        this.vehicle_id = vehicle_id;
    }
    
    public Long getTripId() {
        return trip_id;
    }
    
    public void setTripId(Long trip_id) {
        this.trip_id = trip_id;
    }
    
    public IncidentTypes getIncident_type() {
        return incident_type;
    }
    
    public void setIncident_type(IncidentTypes incident_type) {
        this.incident_type = incident_type;
    }
    
    public Severity getSeverity() {
        return severity;
    }
    
    public void setSeverity(Severity severity) {
        this.severity = severity;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getScreenshot() {
        return screenshot;
    }
    
    public void setScreenshot(String screenshot) {
        this.screenshot = screenshot;
    }
    
    @Override
    public String toString() {
        return "ViolationDTO{" +
                "driver_id=" + driver_id +
                ", vehicle_id=" + vehicle_id +
                ", trip_id=" + trip_id +
                ", incident_type=" + incident_type +
                ", severity=" + severity +
                ", description='" + description + '\'' +
                ", timestamp='" + timestamp + '\'' +
                ", screenshot='" + screenshot + '\'' +
                '}';
    }
}
