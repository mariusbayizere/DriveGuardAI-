/*
package com.example.DriveGuardAI.model;

import java.util.List;

import com.example.DriveGuardAI.Enum.Trips_Status;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;


@Entity
@Table(name = "Trips")
public class Trips {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tripId;

    private String tripName;
    private String startTime;
    private String endTime;
    private Trips_Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    @JsonIgnore
    private Drivers driver;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Incidents> incidents;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnore
    private Vehicles vehicle;

    // Expose just the IDs so the frontend can filter trips by driver
    @JsonProperty("driverId")
    public Long getDriverId() {
        return driver != null ? driver.getId() : null;
    }

    @JsonProperty("vehicleId")
    public Long getVehicleId() {
        return vehicle != null ? vehicle.getVehicleId() : null;
    }

    // Getters & Setters

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getTripName() { return tripName; }
    public void setTripName(String tripName) { this.tripName = tripName; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public Trips_Status getStatus() { return status; }
    public void setStatus(Trips_Status status) { this.status = status; }

    public Drivers getDriver() { return driver; }
    public void setDriver(Drivers driver) { this.driver = driver; }

    public List<Incidents> getIncidents() { return incidents; }
    public void setIncidents(List<Incidents> incidents) { this.incidents = incidents; }

    public Vehicles getVehicle() { return vehicle; }
    public void setVehicle(Vehicles vehicle) { this.vehicle = vehicle; }
}
*/

package com.example.DriveGuardAI.model;

import java.util.List;

import com.example.DriveGuardAI.Enum.Trips_Status;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;

import jakarta.persistence.*;


@Entity
@Table(name = "Trips")
public class Trips {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tripId;

    private String tripName;
    private String startTime;
    private String endTime;
    private Trips_Status status;

    // @JsonIgnore → stops Jackson serializing the full Drivers object (no infinite loop)
    // @JsonSetter  → still allows Jackson to WRITE { "driver": { "id": 1 } } on create/update
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    @JsonIgnore
    private Drivers driver;

    // @JsonIgnore → stops Jackson serializing the full Vehicles object (no infinite loop)
    // @JsonSetter  → still allows Jackson to WRITE { "vehicle": { "vehicleId": 1 } } on create/update
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnore
    private Vehicles vehicle;

    // @JsonIgnore → stops Incidents → Trips → Incidents infinite loop
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Incidents> incidents;

    // Expose flat IDs for the frontend to filter trips by driver/vehicle
    @JsonProperty("driverId")
    public Long getDriverId() {
        return driver != null ? driver.getId() : null;
    }

    @JsonProperty("vehicleId")
    public Long getVehicleId() {
        return vehicle != null ? vehicle.getVehicleId() : null;
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getTripName() { return tripName; }
    public void setTripName(String tripName) { this.tripName = tripName; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public Trips_Status getStatus() { return status; }
    public void setStatus(Trips_Status status) { this.status = status; }

    // getDriver() is @JsonIgnore on the field — Jackson won't serialize it
    public Drivers getDriver() { return driver; }

    // @JsonSetter allows Jackson to deserialize { "driver": { "id": 1 } } from request body
    @JsonSetter("driver")
    public void setDriver(Drivers driver) { this.driver = driver; }

    public Vehicles getVehicle() { return vehicle; }

    // @JsonSetter allows Jackson to deserialize { "vehicle": { "vehicleId": 1 } } from request body
    @JsonSetter("vehicle")
    public void setVehicle(Vehicles vehicle) { this.vehicle = vehicle; }

    public List<Incidents> getIncidents() { return incidents; }
    public void setIncidents(List<Incidents> incidents) { this.incidents = incidents; }
}
