package com.example.DriveGuardAI.controller;

import com.example.DriveGuardAI.Enum.DriverStatus;
import com.example.DriveGuardAI.Enum.IncidentTypes;
import com.example.DriveGuardAI.Enum.Severity;
import com.example.DriveGuardAI.Enum.UserRole;
import com.example.DriveGuardAI.Enum.VehiclesStatus;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.IncidentRepository;
import com.example.DriveGuardAI.repository.TripRepository;
import com.example.DriveGuardAI.repository.UserRepository;
import com.example.DriveGuardAI.repository.VehiclesRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Date;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("IncidentsController Integration Tests")
class IncidentsControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/incidents";

    @Autowired private WebApplicationContext context;
    @Autowired private IncidentRepository   incidentRepository;
    @Autowired private DriverRepository     driverRepository;
    @Autowired private TripRepository       tripRepository;
    @Autowired private VehiclesRepository   vehiclesRepository;
    @Autowired private UserRepository       userRepository;
    @Autowired private PasswordEncoder      passwordEncoder;

    private MockMvc mockMvc;

    // Shared IDs — populated in setUp, reused across tests
    private Long driverId;
    private Long tripId;
    private Long vehicleId;

    // ─── Test Setup ───────────────────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Delete in FK-safe order
        incidentRepository.deleteAll();
        tripRepository.deleteAll();
        vehiclesRepository.deleteAll();
        driverRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Seed User
        Users user = new Users();
        user.setFirstName("Test");
        user.setLastName("Driver");
        user.setEmail("driver.incident@test.com");
        user.setPassword(passwordEncoder.encode("Password1"));
        user.setUserRole(UserRole.DRIVER);
        Users savedUser = userRepository.save(user);

        // 2. Seed Driver
        Drivers driver = new Drivers();
        driver.setLicenseNumber("LIC-TEST-001");
        driver.setHireDate(new Date());
        driver.setSafetyScore((byte) 100);
        driver.setStatus(DriverStatus.ACTIVE);
        driver.setUser(savedUser);
        Drivers savedDriver = driverRepository.save(driver);
        driverId = savedDriver.getId();

        // 3. Seed Vehicle — all NOT NULL columns filled
        Vehicles vehicle = new Vehicles();
        vehicle.setDriver(savedDriver);
        vehicle.setPlateNumber("PLT-001");
        vehicle.setLicensePlate("LIC-PLT-001");
        vehicle.setStatus(VehiclesStatus.ACTIVE);
        vehicle.setModel("Toyota Hilux");
        Vehicles savedVehicle = vehiclesRepository.save(vehicle);
        vehicleId = savedVehicle.getVehicleId();

        // 4. Seed Trip — vehicle is NOT NULL (FK to Vehicles)
        Trips trip = new Trips();
        trip.setDriver(savedDriver);
        trip.setVehicle(savedVehicle);
        trip.setTripName("Test Trip");
        Trips savedTrip = tripRepository.save(trip);
        tripId = savedTrip.getTripId();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Seeds an incident directly into the DB for GET/DELETE tests */
    private Incidents seedIncident() {
        Drivers driver   = driverRepository.findById(driverId).orElseThrow();
        Trips   trip     = tripRepository.findById(tripId).orElseThrow();
        Vehicles vehicle = vehiclesRepository.findById(vehicleId).orElseThrow();

        Incidents i = new Incidents();
        i.setIncident_type(IncidentTypes.PHONE_USE);
        i.setSeverity(Severity.HIGH);
        i.setDescription("Test incident");
        i.setTimestamp("2026-05-02T20:00:00");
        i.setDriver(driver);
        i.setTrip(trip);
        i.setVehicle(vehicle);
        return incidentRepository.save(i);
    }

    /** Sets the driver's safety score before a violation test */
    private void setDriverScore(byte score) {
        Drivers driver = driverRepository.findById(driverId).orElseThrow();
        driver.setSafetyScore(score);
        driverRepository.save(driver);
    }

    /** Builds a valid ViolationDTO JSON payload */
    private String violationJson(Long dId, Long tId, Long vId, String severity) {
        return String.format("""
            {
              "driver_id": %d,
              "trip_id": %d,
              "vehicle_id": %d,
              "incident_type": "PHONE_USE",
              "severity": "%s",
              "description": "Phone use detected by AI",
              "timestamp": "2026-05-02T20:00:00"
            }""", dId, tId, vId, severity);
    }

    // ─── GET /api/v1/incidents ─────────────────────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/incidents")
    class GetAllIncidents {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with empty list when no incidents exist")
        void returnsEmptyList() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with all incidents")
        void returnsAllIncidents() throws Exception {
            seedIncident();
            seedIncident();

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)));
        }
    }

    // ─── GET /api/v1/incidents/{id} ────────────────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/incidents/{id}")
    class GetIncidentById {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with correct incident fields")
        void returnsIncidentWhenFound() throws Exception {
            Incidents saved = seedIncident();

            mockMvc.perform(get(BASE_URL + "/" + saved.getIncident_id()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.incident_type", is("PHONE_USE")))
                    .andExpect(jsonPath("$.severity", is("HIGH")))
                    .andExpect(jsonPath("$.description", is("Test incident")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when incident not found")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─── POST /api/v1/incidents/violation ─────────────────────────────────────
    @Nested
    @DisplayName("POST /api/v1/incidents/violation")
    class ReceiveViolation {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and deducts 5 points for HIGH severity")
        void deductsFivePointsForHigh() throws Exception {
            mockMvc.perform(post(BASE_URL + "/violation")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(violationJson(driverId, tripId, vehicleId, "HIGH")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.safety_score", is(95)))
                    .andExpect(jsonPath("$.driver_status", is("ACTIVE")))
                    .andExpect(jsonPath("$.incident_type", is("PHONE_USE")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and deducts 10 points for CRITICAL severity")
        void deductsTenPointsForCritical() throws Exception {
            mockMvc.perform(post(BASE_URL + "/violation")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(violationJson(driverId, tripId, vehicleId, "CRITICAL")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.safety_score", is(90)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and deducts 3 points for MEDIUM severity")
        void deductsThreePointsForMedium() throws Exception {
            mockMvc.perform(post(BASE_URL + "/violation")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(violationJson(driverId, tripId, vehicleId, "MEDIUM")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.safety_score", is(97)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("auto-suspends driver when score drops below 50")
        void autoSuspendsDriverWhenScoreDropsBelowThreshold() throws Exception {
            setDriverScore((byte) 55); // 55 - 10 = 45 → SUSPENDED

            mockMvc.perform(post(BASE_URL + "/violation")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(violationJson(driverId, tripId, vehicleId, "CRITICAL")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.safety_score", is(45)))
                    .andExpect(jsonPath("$.driver_status", is("SUSPENDED")))
                    .andExpect(jsonPath("$.message", containsString("SUSPENDED")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns warning message when score drops below 70 but stays above 50")
        void returnsWarningWhenScoreBelow70() throws Exception {
            setDriverScore((byte) 72); // 72 - 5 = 67 → warning zone

            mockMvc.perform(post(BASE_URL + "/violation")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(violationJson(driverId, tripId, vehicleId, "HIGH")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.safety_score", is(67)))
                    .andExpect(jsonPath("$.driver_status", is("ACTIVE")))
                    .andExpect(jsonPath("$.message", containsString("Warning")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when required field driver_id is missing")
        void returns400WhenDriverIdMissing() throws Exception {
            String body = """
                {
                  "trip_id": 1,
                  "vehicle_id": 1,
                  "incident_type": "PHONE_USE",
                  "severity": "HIGH",
                  "timestamp": "2026-05-02T20:00:00"
                }""";

            mockMvc.perform(post(BASE_URL + "/violation")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when driver_id does not exist in DB")
        void returns404WhenDriverNotFound() throws Exception {
            mockMvc.perform(post(BASE_URL + "/violation")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(violationJson(99999L, tripId, vehicleId, "HIGH")))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("incident is persisted to the database after violation")
        void incidentPersistedToDatabase() throws Exception {
            mockMvc.perform(post(BASE_URL + "/violation")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(violationJson(driverId, tripId, vehicleId, "LOW")))
                    .andExpect(status().isOk());

            mockMvc.perform(get(BASE_URL)
                            .with(user("admin").roles("ADMIN")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }
    }

    // ─── POST /api/v1/incidents/drivers/{id}/reinstate ─────────────────────────
    @Nested
    @DisplayName("POST /api/v1/incidents/drivers/{id}/reinstate")
    class ReinstateDriver {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and resets score to 100 and status to ACTIVE")
        void reinstatesDriverSuccessfully() throws Exception {
            // Suspend the driver first
            Drivers driver = driverRepository.findById(driverId).orElseThrow();
            driver.setStatus(DriverStatus.SUSPENDED);
            driver.setSafetyScore((byte) 30);
            driverRepository.save(driver);

            mockMvc.perform(post(BASE_URL + "/drivers/" + driverId + "/reinstate"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.safety_score", is(100)))
                    .andExpect(jsonPath("$.driver_status", is("ACTIVE")))
                    .andExpect(jsonPath("$.message", containsString("reinstated")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when driver does not exist")
        void returns404WhenDriverNotFound() throws Exception {
            mockMvc.perform(post(BASE_URL + "/drivers/99999/reinstate"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─── DELETE /api/v1/incidents/{id} ────────────────────────────────────────
    @Nested
    @DisplayName("DELETE /api/v1/incidents/{id}")
    class DeleteIncident {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 204 and removes incident from DB")
        void deletesIncidentSuccessfully() throws Exception {
            Incidents saved = seedIncident();
            Long deletedId = saved.getIncident_id();

            mockMvc.perform(delete(BASE_URL + "/" + deletedId))
                    .andExpect(status().isNoContent());

            // Verify it's gone directly from the repository — avoids a second HTTP call
            boolean stillExists = incidentRepository.existsById(deletedId);
            org.assertj.core.api.Assertions.assertThat(stillExists).isFalse();
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when incident does not exist")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─── GET /api/v1/incidents/driver/{driverId} ──────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/incidents/driver/{driverId}")
    class GetByDriver {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns all incidents for a specific driver")
        void returnsIncidentsByDriver() throws Exception {
            seedIncident();
            seedIncident();

            mockMvc.perform(get(BASE_URL + "/driver/" + driverId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when driver not found")
        void returns404WhenDriverNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/driver/99999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─── GET /api/v1/incidents/trip/{tripId} ──────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/incidents/trip/{tripId}")
    class GetByTrip {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns all incidents for a specific trip")
        void returnsIncidentsByTrip() throws Exception {
            seedIncident();

            mockMvc.perform(get(BASE_URL + "/trip/" + tripId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when trip not found")
        void returns404WhenTripNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/trip/99999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─── GET /api/v1/incidents/vehicle/{vehicleId} ────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/incidents/vehicle/{vehicleId}")
    class GetByVehicle {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns all incidents for a specific vehicle")
        void returnsIncidentsByVehicle() throws Exception {
            seedIncident();

            mockMvc.perform(get(BASE_URL + "/vehicle/" + vehicleId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when vehicle not found")
        void returns404WhenVehicleNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/vehicle/99999"))
                    .andExpect(status().isNotFound());
        }
    }
}
