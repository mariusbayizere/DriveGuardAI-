package com.example.DriveGuardAI.controller;

import com.example.DriveGuardAI.Enum.DriverStatus;
import com.example.DriveGuardAI.Enum.UserRole;
import com.example.DriveGuardAI.Enum.VehiclesStatus;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.DriverRepository;
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

/**
 * Integration tests for VehiclesController (/api/v1/vehicles).
 *
 * Seed order respects FK constraints:
 *   Users → Drivers → Vehicles
 *
 * Uses H2 in-memory DB via src/test/resources/application-test.properties.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("VehiclesController Integration Tests")
class VehiclesControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/vehicles";

    @Autowired private WebApplicationContext context;
    @Autowired private VehiclesRepository   vehiclesRepository;
    @Autowired private DriverRepository     driverRepository;
    @Autowired private UserRepository       userRepository;
    @Autowired private PasswordEncoder      passwordEncoder;

    private MockMvc  mockMvc;
    private Users    seedUser;
    private Drivers  seedDriver;

    // ─────────────────────────────────────────────
    //  Setup
    // ─────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Delete in reverse FK order
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
    }

    // ─────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────

    /** Persist a vehicle directly via repository (bypasses service validation). */
    private Vehicles seedVehicle(String plateNumber, String licensePlate, VehiclesStatus status) {
        Vehicles v = new Vehicles();
        v.setModel("Toyota Hilux");
        v.setPlateNumber(plateNumber);
        v.setLicensePlate(licensePlate);
        v.setStatus(status);
        v.setDriver(seedDriver);
        return vehiclesRepository.save(v);
    }

    /** Build a valid JSON payload for POST/PUT requests. */
    private String vehicleJson(String model, String plateNumber, String licensePlate,
                               String status, Long driverId) {
        return String.format("""
            {
              "model": "%s",
              "plateNumber": "%s",
              "licensePlate": "%s",
              "status": "%s",
              "driver": { "id": %d }
            }""", model, plateNumber, licensePlate, status, driverId);
    }

    // ─────────────────────────────────────────────
    //  GET /api/v1/vehicles
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/vehicles")
    class GetAllVehicles {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with empty list when no vehicles exist")
        void returnsEmptyList() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with all vehicles")
        void returnsAllVehicles() throws Exception {
            seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);
            seedVehicle("RAB 002 B", "RAB 002 B", VehiclesStatus.MAINTENANCE);

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].plateNumber", is("RAA 001 A")))
                    .andExpect(jsonPath("$[1].plateNumber", is("RAB 002 B")));
        }

        @Test
        @DisplayName("returns 200 when unauthenticated (public endpoint)")
        void returnsOkWhenUnauthenticated() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk());
        }
    }

    // ─────────────────────────────────────────────
    //  GET /api/v1/vehicles/{id}
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/vehicles/{id}")
    class GetVehicleById {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with correct fields when vehicle found")
        void returnsVehicleWhenFound() throws Exception {
            Vehicles saved = seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);

            mockMvc.perform(get(BASE_URL + "/" + saved.getVehicleId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.vehicleId",    is(saved.getVehicleId().intValue())))
                    .andExpect(jsonPath("$.plateNumber",  is("RAA 001 A")))
                    .andExpect(jsonPath("$.status",       is("ACTIVE")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when vehicle does not exist")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─────────────────────────────────────────────
    //  POST /api/v1/vehicles
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/v1/vehicles")
    class CreateVehicle {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 201 and Location header with valid payload")
        void createsVehicleSuccessfully() throws Exception {
            String body = vehicleJson(
                    "Isuzu D-Max", "RAB 002 B", "RAB 002 B",
                    "ACTIVE", seedDriver.getId());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", containsString("/api/v1/vehicles/")))
                    .andExpect(jsonPath("$.plateNumber",  is("RAB 002 B")))
                    .andExpect(jsonPath("$.status",       is("ACTIVE")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when plateNumber is missing")
        void returns400WhenPlateNumberMissing() throws Exception {
            String body = String.format("""
                {
                  "model": "Isuzu D-Max",
                  "licensePlate": "RAB 002 B",
                  "status": "ACTIVE",
                  "driver": { "id": %d }
                }""", seedDriver.getId());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when licensePlate is missing")
        void returns400WhenLicensePlateMissing() throws Exception {
            String body = String.format("""
                {
                  "model": "Isuzu D-Max",
                  "plateNumber": "RAB 002 B",
                  "status": "ACTIVE",
                  "driver": { "id": %d }
                }""", seedDriver.getId());

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
                  "model": "Isuzu D-Max",
                  "plateNumber": "RAB 002 B",
                  "licensePlate": "RAB 002 B",
                  "driver": { "id": %d }
                }""", seedDriver.getId());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when driver id references non-existent driver")
        void returns400WhenDriverNotFound() throws Exception {
            String body = vehicleJson(
                    "Isuzu D-Max", "RAB 002 B", "RAB 002 B",
                    "ACTIVE", 99999L);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when licensePlate already exists")
        void returns400WhenLicensePlateDuplicate() throws Exception {
            seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);

            String body = vehicleJson(
                    "Isuzu D-Max", "RAB 002 B", "RAA 001 A",
                    "ACTIVE", seedDriver.getId());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when plateNumber already exists")
        void returns400WhenPlateNumberDuplicate() throws Exception {
            seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);

            String body = vehicleJson(
                    "Isuzu D-Max", "RAA 001 A", "RAB 002 B",
                    "ACTIVE", seedDriver.getId());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("ignores caller-supplied vehicleId and lets DB assign one")
        void ignoresCallerSuppliedId() throws Exception {
            String body = String.format("""
                {
                  "vehicleId": 9999,
                  "model": "Isuzu D-Max",
                  "plateNumber": "RAB 002 B",
                  "licensePlate": "RAB 002 B",
                  "status": "ACTIVE",
                  "driver": { "id": %d }
                }""", seedDriver.getId());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.vehicleId", not(9999)));
        }
    }

    // ─────────────────────────────────────────────
    //  PUT /api/v1/vehicles/{id}
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("PUT /api/v1/vehicles/{id}")
    class UpdateVehicle {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and updates model field")
        void updatesModelSuccessfully() throws Exception {
            Vehicles saved = seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);

            mockMvc.perform(put(BASE_URL + "/" + saved.getVehicleId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "model": "Nissan Navara" }"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.model", is("Nissan Navara")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and updates status field")
        void updatesStatusSuccessfully() throws Exception {
            Vehicles saved = seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);

            mockMvc.perform(put(BASE_URL + "/" + saved.getVehicleId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "status": "MAINTENANCE" }"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("MAINTENANCE")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and updates plateNumber when unique")
        void updatesPlateNumberSuccessfully() throws Exception {
            Vehicles saved = seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);

            mockMvc.perform(put(BASE_URL + "/" + saved.getVehicleId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "plateNumber": "RAC 003 C" }"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.plateNumber", is("RAC 003 C")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when plateNumber is already in use by another vehicle")
        void returns400WhenPlateNumberTaken() throws Exception {
            seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);
            Vehicles target = seedVehicle("RAB 002 B", "RAB 002 B", VehiclesStatus.ACTIVE);

            mockMvc.perform(put(BASE_URL + "/" + target.getVehicleId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "plateNumber": "RAA 001 A" }"""))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when licensePlate is already in use by another vehicle")
        void returns400WhenLicensePlateTaken() throws Exception {
            seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);
            Vehicles target = seedVehicle("RAB 002 B", "RAB 002 B", VehiclesStatus.ACTIVE);

            mockMvc.perform(put(BASE_URL + "/" + target.getVehicleId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "licensePlate": "RAA 001 A" }"""))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when new driver id references non-existent driver")
        void returns400WhenNewDriverNotFound() throws Exception {
            Vehicles saved = seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);

            mockMvc.perform(put(BASE_URL + "/" + saved.getVehicleId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                { "driver": { "id": 99999 } }"""))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when updating non-existent vehicle")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(put(BASE_URL + "/99999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─────────────────────────────────────────────
    //  DELETE /api/v1/vehicles/{id}
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("DELETE /api/v1/vehicles/{id}")
    class DeleteVehicle {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 204 and vehicle is no longer retrievable")
        void deletesVehicleSuccessfully() throws Exception {
            Vehicles saved = seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);

            mockMvc.perform(delete(BASE_URL + "/" + saved.getVehicleId()))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get(BASE_URL + "/" + saved.getVehicleId())
                            .with(user("admin").roles("ADMIN")))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when deleting non-existent vehicle")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("does not affect other vehicles when one is deleted")
        void doesNotAffectOtherVehicles() throws Exception {
            Vehicles keep   = seedVehicle("RAA 001 A", "RAA 001 A", VehiclesStatus.ACTIVE);
            Vehicles remove = seedVehicle("RAB 002 B", "RAB 002 B", VehiclesStatus.INACTIVE);

            mockMvc.perform(delete(BASE_URL + "/" + remove.getVehicleId()))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get(BASE_URL)
                            .with(user("admin").roles("ADMIN")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].plateNumber", is("RAA 001 A")));
        }
    }
}
