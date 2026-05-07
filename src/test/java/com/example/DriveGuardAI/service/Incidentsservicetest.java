package com.example.DriveGuardAI.service;

import com.example.DriveGuardAI.Enum.DriverStatus;
import com.example.DriveGuardAI.Enum.IncidentTypes;
import com.example.DriveGuardAI.Enum.Severity;
import com.example.DriveGuardAI.dto.ViolationDTO;
import com.example.DriveGuardAI.exception.ResourceNotFoundException;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.EmailDetails;
import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.IncidentRepository;
import com.example.DriveGuardAI.repository.TripRepository;
import com.example.DriveGuardAI.repository.VehiclesRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("IncidentsService Unit Tests")
class IncidentsServiceTest {

    @Mock private IncidentRepository incidentRepository;
    @Mock private DriverRepository   driverRepository;
    @Mock private TripRepository     tripRepository;
    @Mock private VehiclesRepository vehiclesRepository;
    @Mock private EmailService       emailService;

    @InjectMocks
    private IncidentsService incidentsService;

    // ─── Seed helpers ─────────────────────────────────────────────────────────

    private Drivers activeDriver(Long id, byte score) {
        Drivers d = new Drivers();
        d.setId(id);
        d.setSafetyScore(score);
        d.setStatus(DriverStatus.ACTIVE);
        return d;
    }

    private Trips trip(Long id) {
        Trips t = new Trips();
        t.setTripId(id);
        return t;
    }

    private Vehicles vehicle(Long id) {
        Vehicles v = new Vehicles();
        v.setVehicleId(id);
        return v;
    }

    private Incidents incident(Long id, Drivers driver) {
        Incidents i = new Incidents();
        i.setIncident_id(id);
        i.setIncident_type(IncidentTypes.PHONE_USE);
        i.setSeverity(Severity.HIGH);
        i.setDescription("Test incident");
        i.setTimestamp("2026-05-02T20:00:00");
        i.setDriver(driver);
        i.setTrip(trip(1L));
        i.setVehicle(vehicle(1L));
        return i;
    }

    /** ViolationDTO uses trip_id (field) but getter is getTripId() */
    private ViolationDTO violationDTO(Long driverId, Long tripId, Long vehicleId, Severity severity) {
        ViolationDTO dto = new ViolationDTO();
        dto.setDriver_id(driverId);
        dto.setTripId(tripId);        // maps to trip_id field
        dto.setVehicle_id(vehicleId);
        dto.setIncident_type(IncidentTypes.PHONE_USE);
        dto.setSeverity(severity);
        dto.setDescription("Detected phone use");
        dto.setTimestamp("2026-05-02T20:00:00");
        return dto;
    }

    private void stubRepos(Drivers driver, Trips t, Vehicles v) {
        when(driverRepository.findById(driver.getId())).thenReturn(Optional.of(driver));
        when(tripRepository.findById(t.getTripId())).thenReturn(Optional.of(t));
        when(vehiclesRepository.findById(v.getVehicleId())).thenReturn(Optional.of(v));
        when(incidentRepository.save(any())).thenAnswer(inv -> {
            Incidents i = inv.getArgument(0);
            i.setIncident_id(1L);
            return i;
        });
        when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(emailService.sendSimpleMail(any(EmailDetails.class))).thenReturn("Mail sent");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  findAll
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("findAll()")
    class FindAll {

        @Test
        @DisplayName("returns all incidents")
        void returnsAllIncidents() {
            Drivers driver = activeDriver(1L, (byte) 100);
            when(incidentRepository.findAll()).thenReturn(List.of(incident(1L, driver)));

            assertThat(incidentsService.findAll()).hasSize(1);
            verify(incidentRepository).findAll();
        }

        @Test
        @DisplayName("returns empty list when no incidents exist")
        void returnsEmptyList() {
            when(incidentRepository.findAll()).thenReturn(List.of());
            assertThat(incidentsService.findAll()).isEmpty();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  findById
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("findById()")
    class FindById {

        @Test
        @DisplayName("returns incident when found")
        void returnsIncidentWhenFound() {
            Drivers driver = activeDriver(1L, (byte) 100);
            when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident(1L, driver)));

            assertThat(incidentsService.findById(1L).getIncident_id()).isEqualTo(1L);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when not found")
        void throwsWhenNotFound() {
            when(incidentRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> incidentsService.findById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Incident not found");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  create
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("saves and returns incident")
        void savesIncident() {
            Drivers driver = activeDriver(1L, (byte) 100);
            Incidents inc = incident(1L, driver);
            when(incidentRepository.save(inc)).thenReturn(inc);

            assertThat(incidentsService.create(inc)).isEqualTo(inc);
            verify(incidentRepository).save(inc);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  update
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("update()")
    class Update {

        @Test
        @DisplayName("updates all fields and saves")
        void updatesIncident() {
            Drivers driver = activeDriver(1L, (byte) 100);
            Incidents existing = incident(1L, driver);

            Incidents payload = new Incidents();
            payload.setIncident_type(IncidentTypes.FATIGUE);
            payload.setSeverity(Severity.CRITICAL);
            payload.setDescription("Updated description");
            payload.setTimestamp("2026-05-03T10:00:00");

            when(incidentRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(incidentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Incidents result = incidentsService.update(1L, payload);

            assertThat(result.getIncident_type()).isEqualTo(IncidentTypes.FATIGUE);
            assertThat(result.getSeverity()).isEqualTo(Severity.CRITICAL);
            assertThat(result.getDescription()).isEqualTo("Updated description");
            assertThat(result.getTimestamp()).isEqualTo("2026-05-03T10:00:00");
        }

        @Test
        @DisplayName("throws when incident not found")
        void throwsWhenNotFound() {
            when(incidentRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> incidentsService.update(99L, new Incidents()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  delete
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("deletes incident when found")
        void deletesIncident() {
            Drivers driver = activeDriver(1L, (byte) 100);
            Incidents inc = incident(1L, driver);
            when(incidentRepository.findById(1L)).thenReturn(Optional.of(inc));

            incidentsService.delete(1L);

            verify(incidentRepository).delete(inc);
        }

        @Test
        @DisplayName("throws when incident not found")
        void throwsWhenNotFound() {
            when(incidentRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> incidentsService.delete(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  createFromViolation — safety score deductions
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("createFromViolation() — safety score deductions")
    class CreateFromViolation {

        @Test
        @DisplayName("deducts 10 points for CRITICAL severity")
        void deductsTenForCritical() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 100);
            stubRepos(driver, trip(1L), vehicle(1L));

            incidentsService.createFromViolation(violationDTO(1L, 1L, 1L, Severity.CRITICAL));
            Thread.sleep(200);

            verify(driverRepository).save(argThat(d -> d.getSafetyScore() == 90));
        }

        @Test
        @DisplayName("deducts 5 points for HIGH severity")
        void deductsFiveForHigh() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 100);
            stubRepos(driver, trip(1L), vehicle(1L));

            incidentsService.createFromViolation(violationDTO(1L, 1L, 1L, Severity.HIGH));
            Thread.sleep(200);

            verify(driverRepository).save(argThat(d -> d.getSafetyScore() == 95));
        }

        @Test
        @DisplayName("deducts 3 points for MEDIUM severity")
        void deductsThreeForMedium() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 100);
            stubRepos(driver, trip(1L), vehicle(1L));

            incidentsService.createFromViolation(violationDTO(1L, 1L, 1L, Severity.MEDIUM));
            Thread.sleep(200);

            verify(driverRepository).save(argThat(d -> d.getSafetyScore() == 97));
        }

        @Test
        @DisplayName("deducts 1 point for LOW severity")
        void deductsOneForLow() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 100);
            stubRepos(driver, trip(1L), vehicle(1L));

            incidentsService.createFromViolation(violationDTO(1L, 1L, 1L, Severity.LOW));
            Thread.sleep(200);

            verify(driverRepository).save(argThat(d -> d.getSafetyScore() == 99));
        }

        @Test
        @DisplayName("auto-suspends driver when score drops below 50")
        void autoSuspendsWhenScoreBelowThreshold() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 55); // 55 - 10 = 45 → SUSPENDED
            stubRepos(driver, trip(1L), vehicle(1L));

            incidentsService.createFromViolation(violationDTO(1L, 1L, 1L, Severity.CRITICAL));
            Thread.sleep(200);

            verify(driverRepository).save(argThat(d ->
                    d.getStatus() == DriverStatus.SUSPENDED && d.getSafetyScore() == 45));
        }

        @Test
        @DisplayName("does NOT suspend driver when score stays at or above 50")
        void doesNotSuspendWhenScoreAboveThreshold() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 60); // 60 - 5 = 55 → still ACTIVE
            stubRepos(driver, trip(1L), vehicle(1L));

            incidentsService.createFromViolation(violationDTO(1L, 1L, 1L, Severity.HIGH));
            Thread.sleep(200);

            verify(driverRepository).save(argThat(d ->
                    d.getStatus() == DriverStatus.ACTIVE && d.getSafetyScore() == 55));
        }

        @Test
        @DisplayName("score is clamped to 0 and never goes negative")
        void scoreClampedToZero() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 3); // 3 - 10 = -7 → clamped to 0
            stubRepos(driver, trip(1L), vehicle(1L));

            incidentsService.createFromViolation(violationDTO(1L, 1L, 1L, Severity.CRITICAL));
            Thread.sleep(200);

            verify(driverRepository).save(argThat(d -> d.getSafetyScore() == 0));
        }

        @Test
        @DisplayName("skips score deduction for already SUSPENDED driver")
        void skipsDeductionForSuspendedDriver() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 30);
            driver.setStatus(DriverStatus.SUSPENDED);

            // Use lenient stubs — email thread is never reached for suspended drivers
            lenient().when(driverRepository.findById(driver.getId())).thenReturn(Optional.of(driver));
            lenient().when(tripRepository.findById(1L)).thenReturn(Optional.of(trip(1L)));
            lenient().when(vehiclesRepository.findById(1L)).thenReturn(Optional.of(vehicle(1L)));
            lenient().when(incidentRepository.save(any())).thenAnswer(inv -> {
                Incidents i = inv.getArgument(0);
                i.setIncident_id(1L);
                return i;
            });
            lenient().when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            lenient().when(emailService.sendSimpleMail(any(EmailDetails.class))).thenReturn("Mail sent");

            incidentsService.createFromViolation(violationDTO(1L, 1L, 1L, Severity.CRITICAL));
            Thread.sleep(200);

            // score must remain unchanged at 30
            verify(driverRepository, never()).save(argThat(d -> d.getSafetyScore() != 30));
        }

        @Test
        @DisplayName("saves the incident with correct fields from ViolationDTO")
        void savesIncidentWithCorrectFields() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 100);
            stubRepos(driver, trip(1L), vehicle(1L));

            ViolationDTO dto = violationDTO(1L, 1L, 1L, Severity.HIGH);
            dto.setIncident_type(IncidentTypes.FATIGUE);
            dto.setDescription("Driver fatigue detected");

            incidentsService.createFromViolation(dto);
            Thread.sleep(200);

            verify(incidentRepository).save(argThat(i ->
                    i.getIncident_type() == IncidentTypes.FATIGUE &&
                    i.getSeverity()      == Severity.HIGH &&
                    "Driver fatigue detected".equals(i.getDescription())));
        }

        @Test
        @DisplayName("sends email notification to manager after incident is saved")
        void sendsEmailNotification() throws InterruptedException {
            Drivers driver = activeDriver(1L, (byte) 100);
            stubRepos(driver, trip(1L), vehicle(1L));

            incidentsService.createFromViolation(violationDTO(1L, 1L, 1L, Severity.HIGH));
            Thread.sleep(300);

            verify(emailService, atLeastOnce()).sendSimpleMail(any(EmailDetails.class));
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when driver not found")
        void throwsWhenDriverNotFound() {
            when(driverRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                incidentsService.createFromViolation(violationDTO(99L, 1L, 1L, Severity.HIGH)))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Driver not found");
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when trip not found")
        void throwsWhenTripNotFound() {
            Drivers driver = activeDriver(1L, (byte) 100);
            when(driverRepository.findById(1L)).thenReturn(Optional.of(driver));
            when(tripRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                incidentsService.createFromViolation(violationDTO(1L, 99L, 1L, Severity.HIGH)))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Trip not found");
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when vehicle not found")
        void throwsWhenVehicleNotFound() {
            Drivers driver = activeDriver(1L, (byte) 100);
            Trips t = trip(1L);
            when(driverRepository.findById(1L)).thenReturn(Optional.of(driver));
            when(tripRepository.findById(1L)).thenReturn(Optional.of(t));
            when(vehiclesRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                incidentsService.createFromViolation(violationDTO(1L, 1L, 99L, Severity.HIGH)))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Vehicle not found");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  reinstateDriver
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("reinstateDriver()")
    class ReinstateDriver {

        @Test
        @DisplayName("resets score to 100 and status to ACTIVE")
        void reinstatesDriver() {
            Drivers suspended = activeDriver(1L, (byte) 30);
            suspended.setStatus(DriverStatus.SUSPENDED);

            when(driverRepository.findById(1L)).thenReturn(Optional.of(suspended));
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Drivers result = incidentsService.reinstateDriver(1L);

            assertThat(result.getSafetyScore()).isEqualTo((byte) 100);
            assertThat(result.getStatus()).isEqualTo(DriverStatus.ACTIVE);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when driver not found")
        void throwsWhenDriverNotFound() {
            when(driverRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> incidentsService.reinstateDriver(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Driver not found");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Query methods
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("Query methods")
    class QueryMethods {

        @Test
        @DisplayName("findByDriverId returns driver's incidents")
        void findByDriverId() {
            Drivers driver = activeDriver(1L, (byte) 100);
            driver.setIncidents(List.of(incident(1L, driver)));
            when(driverRepository.findById(1L)).thenReturn(Optional.of(driver));

            assertThat(incidentsService.findByDriverId(1L)).hasSize(1);
        }

        @Test
        @DisplayName("findByDriverId throws when driver not found")
        void findByDriverIdThrows() {
            when(driverRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> incidentsService.findByDriverId(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("findByTripId returns trip's incidents")
        void findByTripId() {
            Drivers driver = activeDriver(1L, (byte) 100);
            Trips t = trip(1L);
            t.setIncidents(List.of(incident(1L, driver)));
            when(tripRepository.findById(1L)).thenReturn(Optional.of(t));

            assertThat(incidentsService.findByTripId(1L)).hasSize(1);
        }

        @Test
        @DisplayName("findByTripId throws when trip not found")
        void findByTripIdThrows() {
            when(tripRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> incidentsService.findByTripId(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("findByVehicleId returns vehicle's incidents")
        void findByVehicleId() {
            Drivers driver = activeDriver(1L, (byte) 100);
            Vehicles v = vehicle(1L);
            v.setIncidents(List.of(incident(1L, driver)));
            when(vehiclesRepository.findById(1L)).thenReturn(Optional.of(v));

            assertThat(incidentsService.findByVehicleId(1L)).hasSize(1);
        }

        @Test
        @DisplayName("findByVehicleId throws when vehicle not found")
        void findByVehicleIdThrows() {
            when(vehiclesRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> incidentsService.findByVehicleId(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
