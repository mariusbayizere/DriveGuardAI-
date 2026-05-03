package com.example.DriveGuardAI.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.DriveGuardAI.dto.ViolationDTO;
import com.example.DriveGuardAI.exception.ResourceNotFoundException;
import com.example.DriveGuardAI.Enum.DriverStatus;
import com.example.DriveGuardAI.Enum.Severity;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.EmailDetails;
import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.IncidentRepository;
import com.example.DriveGuardAI.repository.TripRepository;
import com.example.DriveGuardAI.repository.VehiclesRepository;
import org.springframework.beans.factory.annotation.Value;

@Service
@Transactional
public class IncidentsService {

    // ─── Score thresholds ─────────────────────────────────────────────────────
    private static final byte DEFAULT_SAFETY_SCORE = 100;
    private static final byte SUSPENSION_THRESHOLD = 50;

    // ─── Deduction per severity ───────────────────────────────────────────────
    private static final byte DEDUCTION_CRITICAL = 10;
    private static final byte DEDUCTION_HIGH     = 5;
    private static final byte DEDUCTION_MEDIUM   = 3;
    private static final byte DEDUCTION_LOW      = 1;

    private final IncidentRepository incidentRepository;
    private final DriverRepository   driverRepository;
    private final TripRepository     tripRepository;
    private final VehiclesRepository vehiclesRepository;
    private final EmailService       emailService;       // ← injected for notifications

    @Value("${app.manager.email:manager@fleet.com}")
    private String managerEmail;

    public IncidentsService(
            IncidentRepository incidentRepository,
            DriverRepository   driverRepository,
            TripRepository     tripRepository,
            VehiclesRepository vehiclesRepository,
            EmailService       emailService) {
        this.incidentRepository = incidentRepository;
        this.driverRepository   = driverRepository;
        this.tripRepository     = tripRepository;
        this.vehiclesRepository = vehiclesRepository;
        this.emailService       = emailService;
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    public List<Incidents> findAll() {
        return incidentRepository.findAll();
    }

    public Incidents findById(Long id) {
        return incidentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
    }

    public Incidents create(Incidents incident) {
        return incidentRepository.save(incident);
    }

    public Incidents update(Long id, Incidents incident) {
        Incidents existing = findById(id);
        existing.setIncident_type(incident.getIncident_type());
        existing.setDescription(incident.getDescription());
        existing.setSeverity(incident.getSeverity());
        existing.setTimestamp(incident.getTimestamp());
        return incidentRepository.save(existing);
    }

    public void delete(Long id) {
        Incidents incident = findById(id);
        incidentRepository.delete(incident);
    }

    // ─── PYTHON AI SERVICE INTEGRATION ────────────────────────────────────────

    /**
     * Creates an incident from the Python AI violation payload.
     *
     * Flow:
     *  1. Fetch driver, trip, vehicle
     *  2. Save incident
     *  3. Deduct safety score (CRITICAL -10, HIGH -5, MEDIUM -3, LOW -1)
     *  4. Auto-suspend driver if score drops below 50
     *  5. Send email notification to manager         ← NEW
     */
    public Incidents createFromViolation(ViolationDTO violationDTO) {
        // Fetch related entities
        Drivers driver = driverRepository.findById(violationDTO.getDriver_id())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Driver not found with id: " + violationDTO.getDriver_id()));

        Trips trip = tripRepository.findById(violationDTO.getTripId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Trip not found with id: " + violationDTO.getTripId()));
        tripRepository.flush();

        Vehicles vehicle = vehiclesRepository.findById(violationDTO.getVehicle_id())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Vehicle not found with id: " + violationDTO.getVehicle_id()));
        vehiclesRepository.flush();

        // Build and save incident
        Incidents incident = new Incidents();
        incident.setIncident_type(violationDTO.getIncident_type());
        incident.setSeverity(violationDTO.getSeverity());
        incident.setDescription(violationDTO.getDescription());
        incident.setTimestamp(violationDTO.getTimestamp());
        incident.setDriver(driver);
        incident.setTrip(trip);
        incident.setVehicle(vehicle);

        Incidents savedIncident = incidentRepository.save(incident);

        System.out.printf("💾 Incident saved — ID: %d | Type: %s | Severity: %s%n",
            savedIncident.getIncident_id(),
            savedIncident.getIncident_type(),
            savedIncident.getSeverity());

        // Update safety score (may auto-suspend driver)
        updateDriverSafetyScore(driver, violationDTO.getSeverity());

        // ✅ Send email notification to fleet manager
        sendViolationEmail(savedIncident, driver);

        return savedIncident;
    }

    // ─── QUERY METHODS ────────────────────────────────────────────────────────

    public List<Incidents> findByDriverId(Long driverId) {
        Drivers driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        return driver.getIncidents();
    }

    public List<Incidents> findByTripId(Long tripId) {
        Trips trip = tripRepository.findById(tripId)
            .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        return trip.getIncidents();
    }

    public List<Incidents> findByVehicleId(Long vehicleId) {
        Vehicles vehicle = vehiclesRepository.findById(vehicleId)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
        return vehicle.getIncidents();
    }

    // ─── SAFETY SCORE LOGIC ───────────────────────────────────────────────────

    private void updateDriverSafetyScore(Drivers driver, Severity severity) {
        if (DriverStatus.SUSPENDED.equals(driver.getStatus())) {
            System.out.printf("⚠️  Driver %d is already SUSPENDED — no further deduction%n",
                driver.getId());
            return;
        }

        byte currentScore = driver.getSafetyScore() != null
            ? driver.getSafetyScore() : DEFAULT_SAFETY_SCORE;

        byte deduction = resolveDeduction(severity);
        byte newScore  = (byte) Math.max(0, currentScore - deduction);

        driver.setSafetyScore(newScore);

        System.out.printf("📉 Driver %d safety score: %d → %d  (-%d for %s)%n",
            driver.getId(), currentScore, newScore, deduction, severity);

        if (newScore < SUSPENSION_THRESHOLD) {
            driver.setStatus(DriverStatus.SUSPENDED);
            System.out.printf("🚫 Driver %d AUTO-SUSPENDED — score %d below threshold %d%n",
                driver.getId(), newScore, SUSPENSION_THRESHOLD);
        }

        driverRepository.save(driver);
    }

    public Drivers reinstateDriver(Long driverId) {
        Drivers driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));

        driver.setSafetyScore(DEFAULT_SAFETY_SCORE);
        driver.setStatus(DriverStatus.ACTIVE);

        System.out.printf("✅ Driver %d reinstated — score reset to %d%n",
            driverId, DEFAULT_SAFETY_SCORE);

        return driverRepository.save(driver);
    }

    // ─── EMAIL NOTIFICATION ───────────────────────────────────────────────────

    /**
     * Sends an HTML email to the fleet manager using the existing EmailServiceImpl.
     * Runs in a separate thread so it never blocks the main transaction.
     */
    private void sendViolationEmail(Incidents incident, Drivers driver) {
        Thread.ofVirtual().start(() -> {
            try {
                String subject = String.format("[DriveGuardAI] %s Alert — Driver %d (%s)",
                    incident.getIncident_type(),
                    driver.getId(),
                    incident.getSeverity());

                String body = buildEmailBody(incident, driver);

                EmailDetails details = new EmailDetails(managerEmail, body, subject);
                String result = emailService.sendSimpleMail(details);
                System.out.println("📧 Email notification: " + result);
            } catch (Exception e) {
                // Email failure must never crash the incident save
                System.err.println("⚠️  Email notification failed (non-critical): " + e.getMessage());
            }
        });
    }

    private String buildEmailBody(Incidents incident, Drivers driver) {
        return String.format("""
            DriveGuardAI — Violation Alert
            ================================

            A violation was detected by the AI monitoring system.

            Incident Type  : %s
            Severity       : %s
            Description    : %s
            Time           : %s
            Driver ID      : %d
            Safety Score   : %d / 100
            Driver Status  : %s
            Trip ID        : %s
            Vehicle ID     : %s

            %s

            Please log in to the DriveGuardAI dashboard to review.
            """,
            incident.getIncident_type(),
            incident.getSeverity(),
            incident.getDescription(),
            incident.getTimestamp(),
            driver.getId(),
            driver.getSafetyScore() != null ? driver.getSafetyScore() : 100,
            driver.getStatus() != null ? driver.getStatus().name() : "ACTIVE",
            incident.getTrip()    != null ? incident.getTrip().getTripId().toString()       : "N/A",
            incident.getVehicle() != null ? incident.getVehicle().getVehicleId().toString() : "N/A",
            DriverStatus.SUSPENDED.equals(driver.getStatus())
                ? "⚠️  WARNING: Driver has been AUTO-SUSPENDED due to low safety score."
                : ""
        );
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private byte resolveDeduction(Severity severity) {
        if (severity == null) return DEDUCTION_LOW;
        return switch (severity) {
            case CRITICAL -> DEDUCTION_CRITICAL;
            case HIGH     -> DEDUCTION_HIGH;
            case MEDIUM   -> DEDUCTION_MEDIUM;
            case LOW      -> DEDUCTION_LOW;
        };
    }
}
