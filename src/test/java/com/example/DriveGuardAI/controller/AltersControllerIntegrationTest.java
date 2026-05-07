package com.example.DriveGuardAI.controller;

import com.example.DriveGuardAI.Enum.*;
import com.example.DriveGuardAI.model.*;
import com.example.DriveGuardAI.repository.*;
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

/**
 * Integration tests for AltersController (/api/v1/alerts).
 *
 * Seed order respects FK constraints:
 *   Users → Drivers → Vehicles → Trips → Incidents → Alters
 *
 * Uses H2 in-memory DB via src/test/resources/application-test.properties.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("AltersController Integration Tests")
class AltersControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/alerts";

    @Autowired private WebApplicationContext context;
    @Autowired private AltersRepository     altersRepository;
    @Autowired private IncidentRepository   incidentRepository;
    @Autowired private TripRepository       tripRepository;
    @Autowired private VehiclesRepository   vehiclesRepository;
    @Autowired private DriverRepository     driverRepository;
    @Autowired private UserRepository       userRepository;
    @Autowired private PasswordEncoder      passwordEncoder;

    private MockMvc   mockMvc;
    private Users     seedUser;
    private Drivers   seedDriver;
    private Vehicles  seedVehicle;
    private Trips     seedTrip;
    private Incidents seedIncident;

    // ─────────────────────────────────────────────
    //  Setup
    // ─────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Delete in reverse FK dependency order
        altersRepository.deleteAll();
        incidentRepository.deleteAll();
        tripRepository.deleteAll();
        vehiclesRepository.deleteAll();
        driverRepository.deleteAll();
        userRepository.deleteAll();

        // 1. User
        seedUser = new Users();
        seedUser.setFirstName("John");
        seedUser.setLastName("Doe");
        seedUser.setEmail("john.doe@example.com");
        seedUser.setPassword(passwordEncoder.encode("Password1"));
        seedUser.setUserRole(UserRole.DRIVER);
        seedUser.setPhoneNumber("+250788000000");
        seedUser = userRepository.save(seedUser);

        // 2. Driver — requires User
        seedDriver = new Drivers();
        seedDriver.setLicenseNumber("LIC-TEST-001");
        seedDriver.setHireDate(new Date());
        seedDriver.setSafetyScore((byte) 90);
        seedDriver.setStatus(DriverStatus.ACTIVE);
        seedDriver.setUser(seedUser);
        seedDriver = driverRepository.save(seedDriver);

        // 3. Vehicle — requires Driver
        seedVehicle = new Vehicles();
        seedVehicle.setModel("Toyota Hilux");
        seedVehicle.setPlateNumber("RAA 001 A");
        seedVehicle.setLicensePlate("RAA 001 A");
        seedVehicle.setStatus(VehiclesStatus.ACTIVE);
        seedVehicle.setDriver(seedDriver);
        seedVehicle = vehiclesRepository.save(seedVehicle);

        // 4. Trip — requires Driver + Vehicle
        seedTrip = new Trips();
        seedTrip.setTripName("Test Trip");
        seedTrip.setStartTime("2024-01-01T08:00:00");
        seedTrip.setEndTime("2024-01-01T10:00:00");
        seedTrip.setStatus(Trips_Status.COMPLETED);
        seedTrip.setDriver(seedDriver);
        seedTrip.setVehicle(seedVehicle);
        seedTrip = tripRepository.save(seedTrip);

        // 5. Incident — requires Driver + Trip + Vehicle
        seedIncident = new Incidents();
        seedIncident.setDescription("Test incident");
        seedIncident.setTimestamp("2024-01-01T09:00:00");
        seedIncident.setIncident_type(IncidentTypes.PHONE_USE);
        seedIncident.setSeverity(Severity.LOW);
        seedIncident.setDriver(seedDriver);
        seedIncident.setTrip(seedTrip);
        seedIncident.setVehicle(seedVehicle);
        seedIncident = incidentRepository.save(seedIncident);
    }

    // ─────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────

    private Alters seedAlert(String message, Alerts_Status status) {
        Alters a = new Alters();
        a.setMessage(message);
        a.setSentAt("2024-01-01T10:00:00");
        a.setStatus(status);
        a.setUser(seedUser);
        a.setIncident(seedIncident);
        return altersRepository.save(a);
    }

    private String alertJson(String message, String sentAt, String status,
                             Long userId, Long incidentId) {
        return String.format("""
            {
              "message": "%s",
              "sentAt": "%s",
              "status": "%s",
              "user": { "id": %d },
              "incident": { "incident_id": %d }
            }""", message, sentAt, status, userId, incidentId);
    }

    // ─────────────────────────────────────────────
    //  GET /api/v1/alerts
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/alerts")
    class GetAllAlerts {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with empty list when no alerts exist")
        void returnsEmptyList() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with all alerts")
        void returnsAllAlerts() throws Exception {
            seedAlert("Alert one", Alerts_Status.UNREAD);
            seedAlert("Alert two", Alerts_Status.SENT);

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].message", is("Alert one")))
                    .andExpect(jsonPath("$[1].message", is("Alert two")));
        }

        @Test
        @DisplayName("returns 200 when unauthenticated (public endpoint)")
        void returnsOkWhenUnauthenticated() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk());
        }
    }

    // ─────────────────────────────────────────────
    //  GET /api/v1/alerts/user/{userId}
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/alerts/user/{userId}")
    class GetAlertsByUser {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns only alerts belonging to the given user")
        void returnsAlertsByUser() throws Exception {
            seedAlert("User alert", Alerts_Status.UNREAD);

            Users other = new Users();
            other.setFirstName("Alice");
            other.setLastName("Other");
            other.setEmail("alice@example.com");
            other.setPassword(passwordEncoder.encode("Password1"));
            other.setUserRole(UserRole.DRIVER);
            other = userRepository.save(other);

            mockMvc.perform(get(BASE_URL + "/user/" + seedUser.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].message", is("User alert")));

            mockMvc.perform(get(BASE_URL + "/user/" + other.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns empty list for user with no alerts")
        void returnsEmptyListForUserWithNoAlerts() throws Exception {
            mockMvc.perform(get(BASE_URL + "/user/" + seedUser.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    // ─────────────────────────────────────────────
    //  GET /api/v1/alerts/{id}
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/alerts/{id}")
    class GetAlertById {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with correct fields when alert found")
        void returnsAlertWhenFound() throws Exception {
            Alters saved = seedAlert("Found alert", Alerts_Status.SENT);

            mockMvc.perform(get(BASE_URL + "/" + saved.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id",      is(saved.getId().intValue())))
                    .andExpect(jsonPath("$.message", is("Found alert")))
                    .andExpect(jsonPath("$.status",  is("SENT")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when alert does not exist")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─────────────────────────────────────────────
    //  POST /api/v1/alerts
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/v1/alerts")
    class CreateAlert {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 201 and Location header with valid payload")
        void createsAlertSuccessfully() throws Exception {
            String body = alertJson(
                    "Speeding detected", "2024-06-01T08:30:00", "UNREAD",
                    seedUser.getId(), seedIncident.getIncident_id());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", containsString("/api/v1/alerts/")))
                    .andExpect(jsonPath("$.message", is("Speeding detected")))
                    .andExpect(jsonPath("$.status",  is("UNREAD")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when message is missing")
        void returns400WhenMessageMissing() throws Exception {
            String body = String.format("""
                {
                  "sentAt": "2024-06-01T08:30:00",
                  "status": "UNREAD",
                  "user": { "id": %d },
                  "incident": { "incident_id": %d }
                }""", seedUser.getId(), seedIncident.getIncident_id());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when sentAt is missing")
        void returns400WhenSentAtMissing() throws Exception {
            String body = String.format("""
                {
                  "message": "Test alert",
                  "status": "UNREAD",
                  "user": { "id": %d },
                  "incident": { "incident_id": %d }
                }""", seedUser.getId(), seedIncident.getIncident_id());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when status is missing")
        void returns400WhenStatusMissing() throws Exception {
            String body = String.format("""
                {
                  "message": "Test alert",
                  "sentAt": "2024-06-01T08:30:00",
                  "user": { "id": %d },
                  "incident": { "incident_id": %d }
                }""", seedUser.getId(), seedIncident.getIncident_id());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when user id references non-existent user")
        void returns400WhenUserNotFound() throws Exception {
            String body = alertJson(
                    "Ghost user alert", "2024-06-01T08:30:00", "UNREAD",
                    99999L, seedIncident.getIncident_id());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when incident id references non-existent incident")
        void returns400WhenIncidentNotFound() throws Exception {
            String body = alertJson(
                    "Ghost incident alert", "2024-06-01T08:30:00", "UNREAD",
                    seedUser.getId(), 99999L);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("ignores caller-supplied id and lets DB assign one")
        void ignoresCallerSuppliedId() throws Exception {
            String body = String.format("""
                {
                  "id": 9999,
                  "message": "Id override attempt",
                  "sentAt": "2024-06-01T08:30:00",
                  "status": "SENT",
                  "user": { "id": %d },
                  "incident": { "incident_id": %d }
                }""", seedUser.getId(), seedIncident.getIncident_id());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", not(9999)));
        }
    }

    // ─────────────────────────────────────────────
    //  PUT /api/v1/alerts/{id}
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("PUT /api/v1/alerts/{id}")
    class UpdateAlert {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and updates message field")
        void updatesMessageSuccessfully() throws Exception {
            Alters saved = seedAlert("Old message", Alerts_Status.UNREAD);

            mockMvc.perform(put(BASE_URL + "/" + saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "message": "Updated message" }"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message", is("Updated message")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and updates status field")
        void updatesStatusSuccessfully() throws Exception {
            Alters saved = seedAlert("Status test", Alerts_Status.UNREAD);

            mockMvc.perform(put(BASE_URL + "/" + saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "status": "READ" }"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("READ")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and updates sentAt field")
        void updatesSentAtSuccessfully() throws Exception {
            Alters saved = seedAlert("SentAt test", Alerts_Status.SENT);

            mockMvc.perform(put(BASE_URL + "/" + saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "sentAt": "2025-12-31T23:59:59" }"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sentAt", is("2025-12-31T23:59:59")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and reassigns alert to a different user")
        void updatesUserSuccessfully() throws Exception {
            Alters saved = seedAlert("Reassign test", Alerts_Status.UNREAD);

            Users newUser = new Users();
            newUser.setFirstName("Bob");
            newUser.setLastName("Reassigned");
            newUser.setEmail("bob.reassigned@example.com");
            newUser.setPassword(passwordEncoder.encode("Password1"));
            newUser.setUserRole(UserRole.DRIVER);
            newUser = userRepository.save(newUser);

            String body = String.format("""
                { "user": { "id": %d } }""", newUser.getId());

            mockMvc.perform(put(BASE_URL + "/" + saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when updating non-existent alert")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(put(BASE_URL + "/99999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when updating user id to non-existent user")
        void returns400WhenNewUserNotFound() throws Exception {
            Alters saved = seedAlert("Bad user update", Alerts_Status.UNREAD);

            mockMvc.perform(put(BASE_URL + "/" + saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "user": { "id": 99999 } }"""))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when updating incident id to non-existent incident")
        void returns400WhenNewIncidentNotFound() throws Exception {
            Alters saved = seedAlert("Bad incident update", Alerts_Status.UNREAD);

            mockMvc.perform(put(BASE_URL + "/" + saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "incident": { "incident_id": 99999 } }"""))
                    .andExpect(status().isBadRequest());
        }
    }

    // ─────────────────────────────────────────────
    //  DELETE /api/v1/alerts/{id}
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("DELETE /api/v1/alerts/{id}")
    class DeleteAlert {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 204 and alert is no longer retrievable")
        void deletesAlertSuccessfully() throws Exception {
            Alters saved = seedAlert("To be deleted", Alerts_Status.UNREAD);

            mockMvc.perform(delete(BASE_URL + "/" + saved.getId()))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get(BASE_URL + "/" + saved.getId())
                            .with(user("admin").roles("ADMIN")))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when deleting non-existent alert")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("does not affect other alerts when one is deleted")
        void doesNotAffectOtherAlerts() throws Exception {
            Alters keep   = seedAlert("Keep me",   Alerts_Status.READ);
            Alters remove = seedAlert("Remove me", Alerts_Status.UNREAD);

            mockMvc.perform(delete(BASE_URL + "/" + remove.getId()))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get(BASE_URL)
                            .with(user("admin").roles("ADMIN")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].message", is("Keep me")));
        }
    }
}
