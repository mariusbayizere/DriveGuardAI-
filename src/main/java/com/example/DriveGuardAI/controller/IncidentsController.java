/*
package com.example.DriveGuardAI.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.DriveGuardAI.dto.ViolationDTO;
import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.service.IncidentsService;

import jakarta.validation.Valid;


// Controller for handling incidents
// Includes endpoint to receive violations from Python AI service
// Save as: ~/DriveGuardAI-/src/main/java/com/example/DriveGuardAI/controller/IncidentsController.java
@RestController
@RequestMapping("/api/v1/incidents")
//@CrossOrigin(origins = "*")
@CrossOrigin(originPatterns = "http://localhost:[*]", allowCredentials = "false")
public class IncidentsController {
    
    private final IncidentsService incidentsService;
    
    public IncidentsController(IncidentsService incidentsService) {
        this.incidentsService = incidentsService;
    }
    
    // ========================================
    // STANDARD CRUD OPERATIONS
    // ========================================
    
    @GetMapping
    public ResponseEntity<List<Incidents>> getAllIncidents() {
        return ResponseEntity.ok(incidentsService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Incidents> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentsService.findById(id));
    }
    
    @PostMapping
    public ResponseEntity<Incidents> createIncident(@Valid @RequestBody Incidents incident) {
        Incidents created = incidentsService.create(incident);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getIncident_id())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Incidents> updateIncident(
            @PathVariable Long id, 
            @Valid @RequestBody Incidents incident) {
        Incidents updated = incidentsService.update(id, incident);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentsService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    // ========================================
    // PYTHON AI SERVICE ENDPOINT
    // ========================================
    
    
     // Endpoint to receive violations from Python AI service
    // Called automatically when driver monitoring system detects viola
    @PostMapping("/violation")
    public ResponseEntity<Incidents> receiveViolation(@Valid @RequestBody ViolationDTO violationDTO) {
        try {
            System.out.println("📥 Received violation from Python AI: " + violationDTO);
            
            // Create incident from violation data
            Incidents incident = incidentsService.createFromViolation(violationDTO);
            
            System.out.println("✅ Violation saved to database: ID=" + incident.getIncident_id());
            
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/../{id}")
                .buildAndExpand(incident.getIncident_id())
                .toUri();
            
            return ResponseEntity.created(location).body(incident);
            
        } catch (Exception e) {
            System.err.println("❌ Error processing violation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    // ========================================
    // QUERY ENDPOINTS
    // ========================================
    
    
    //  Get all incidents for a specific driver
     
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Incidents>> getIncidentsByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(incidentsService.findByDriverId(driverId));
    }
    
    
     // Get all incidents for a specific trip
    
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Incidents>> getIncidentsByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(incidentsService.findByTripId(tripId));
    }
    
    
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Incidents>> getIncidentsByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(incidentsService.findByVehicleId(vehicleId));
    }
}

*/

package com.example.DriveGuardAI.controller;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.DriveGuardAI.dto.ViolationDTO;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.service.IncidentsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/incidents")
@CrossOrigin(originPatterns = "http://localhost:[*]", allowCredentials = "false")
public class IncidentsController {

    private final IncidentsService incidentsService;

    public IncidentsController(IncidentsService incidentsService) {
        this.incidentsService = incidentsService;
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Incidents>> getAllIncidents() {
        return ResponseEntity.ok(incidentsService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incidents> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentsService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Incidents> createIncident(@Valid @RequestBody Incidents incident) {
        Incidents created = incidentsService.create(incident);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getIncident_id())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incidents> updateIncident(
            @PathVariable Long id,
            @Valid @RequestBody Incidents incident) {
        return ResponseEntity.ok(incidentsService.update(id, incident));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentsService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ─── PYTHON AI SERVICE ENDPOINT ───────────────────────────────────────────

    /**
     * POST /api/v1/incidents/violation
     *
     * Receives a violation from the Python AI service.
     * After saving the incident it:
     *   - Deducts driver safety score (CRITICAL -10, HIGH -5, MEDIUM -3, LOW -1)
     *   - Auto-suspends the driver if score drops below 50
     *
     * Returns the saved incident PLUS the driver's updated score and status
     * so the Python service can log or display them.
     */
    @PostMapping("/violation")
    public ResponseEntity<?> receiveViolation(@Valid @RequestBody ViolationDTO violationDTO) {
        try {
            System.out.println("📥 Received violation from Python AI: " + violationDTO);

            Incidents incident = incidentsService.createFromViolation(violationDTO);

            // Fetch updated driver to include fresh score/status in response
            Drivers updatedDriver = incident.getDriver();

            // Build a rich response the Python service and frontend can use
            Map<String, Object> response = new HashMap<>();
            response.put("incident_id",    incident.getIncident_id());
            response.put("incident_type",  incident.getIncident_type());
            response.put("severity",       incident.getSeverity());
            response.put("description",    incident.getDescription());
            response.put("timestamp",      incident.getTimestamp());
            response.put("driver_id",      updatedDriver.getId());
            response.put("safety_score",   updatedDriver.getSafetyScore());
            response.put("driver_status",  updatedDriver.getStatus().name());
            response.put("message",        buildStatusMessage(updatedDriver));

            System.out.printf("✅ Violation processed — Incident ID: %d | Driver %d score: %d | Status: %s%n",
                incident.getIncident_id(),
                updatedDriver.getId(),
                updatedDriver.getSafetyScore(),
                updatedDriver.getStatus().name());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error processing violation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // ─── REINSTATE ENDPOINT ───────────────────────────────────────────────────

    /**
     * POST /api/v1/incidents/drivers/{driverId}/reinstate
     *
     * Admin endpoint to reinstate a suspended driver after review.
     * Resets safety score to 100 and status back to ACTIVE.
     */
    @PostMapping("/drivers/{driverId}/reinstate")
    public ResponseEntity<?> reinstateDriver(@PathVariable Long driverId) {
        Drivers driver = incidentsService.reinstateDriver(driverId);

        Map<String, Object> response = new HashMap<>();
        response.put("driver_id",     driver.getId());
        response.put("safety_score",  driver.getSafetyScore());
        response.put("driver_status", driver.getStatus().name());
        response.put("message",       "Driver reinstated. Safety score reset to 100.");

        return ResponseEntity.ok(response);
    }

    // ─── QUERY ENDPOINTS ──────────────────────────────────────────────────────

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Incidents>> getIncidentsByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(incidentsService.findByDriverId(driverId));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Incidents>> getIncidentsByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(incidentsService.findByTripId(tripId));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Incidents>> getIncidentsByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(incidentsService.findByVehicleId(vehicleId));
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private String buildStatusMessage(Drivers driver) {
        byte score = driver.getSafetyScore();
        String status = driver.getStatus().name();

        if ("SUSPENDED".equals(status)) {
            return String.format(
                "🚫 Driver SUSPENDED — safety score dropped to %d (threshold: 50). Admin review required.",
                score);
        } else if (score < 70) {
            return String.format(
                "⚠️ Warning: Safety score is %d. Driver is approaching suspension threshold.",
                score);
        } else {
            return String.format("Violation recorded. Current safety score: %d", score);
        }
    }
}
