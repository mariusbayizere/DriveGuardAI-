package com.example.DriveGuardAI.controller;

import com.example.DriveGuardAI.Enum.DriverStatus;
import com.example.DriveGuardAI.Enum.Trips_Status;
import com.example.DriveGuardAI.Enum.UserRole;
import com.example.DriveGuardAI.Enum.VehiclesStatus;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.DriverRepository;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("TripsController Integration Tests")
class TripsControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/trips";

    @Autowired private WebApplicationContext context;
    @Autowired private TripRepository       tripRepository;
    @Autowired private DriverRepository     driverRepository;
    @Autowired private VehiclesRepository   vehiclesRepository;
    @Autowired private UserRepository       userRepository;
    @Autowired private PasswordEncoder      passwordEncoder;

    private MockMvc mockMvc;

    // Shared IDs — populated in setUp, reused across tests
    private Long driverId;
    private Long vehicleId;
    private Long tripId;

    // ─── Test Setup ───────────────────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Delete in FK-safe order
        tripRepository.deleteAll();
        vehiclesRepository.deleteAll();
        driverRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Seed User
        Users user = new Users();
        user.setFirstName("Trip");
        user.setLastName("Driver");
        user.setEmail("trip.driver@test.com");
        user.setPassword(passwordEncoder.encode("Password1"));
        user.setUserRole(UserRole.DRIVER);
        Users savedUser = userRepository.save(user);

        // 2. Seed Driver
        Drivers driver = new Drivers();
        driver.setLicenseNumber("LIC-TRIP-001");
        driver.setHireDate(new Date());
        driver.setSafetyScore((byte) 100);
        driver.setStatus(DriverStatus.ACTIVE);
        driver.setUser(savedUser);
        Drivers savedDriver = driverRepository.save(driver);
        driverId = savedDriver.getId();

        // 3. Seed Vehicle
        Vehicles vehicle = new Vehicles();
        vehicle.setDriver(savedDriver);
        vehicle.setPlateNumber("PLT-TRIP-001");
        vehicle.setLicensePlate("LIC-PLT-TRIP-001");
        vehicle.setModel("Toyota Hilux");
        vehicle.setStatus(VehiclesStatus.ACTIVE);
        Vehicles savedVehicle = vehiclesRepository.save(vehicle);
        vehicleId = savedVehicle.getVehicleId();

        // 4. Seed Trip
        Trips trip = new Trips();
        trip.setTripName("Morning Route");
        trip.setStartTime("2026-05-03T08:00:00");
        trip.setEndTime("2026-05-03T10:00:00");
        trip.setStatus(Trips_Status.COMPLETED);
        trip.setDriver(savedDriver);
        trip.setVehicle(savedVehicle);
        Trips savedTrip = tripRepository.save(trip);
        tripId = savedTrip.getTripId();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Builds a valid create-trip JSON payload */
    private String createJson(String name, String status) {
        return String.format("""
                {
                  "tripName": "%s",
                  "startTime": "2026-05-04T08:00:00",
                  "endTime": "2026-05-04T10:00:00",
                  "status": "%s",
                  "driver": { "id": %d },
                  "vehicle": { "vehicleId": %d }
                }""", name, status, driverId, vehicleId);
    }

    /** Seeds an additional trip directly into the DB */
    private Trips seedTrip(String name) {
        Drivers driver = driverRepository.findById(driverId).orElseThrow();
        Vehicles vehicle = vehiclesRepository.findById(vehicleId).orElseThrow();

        Trips t = new Trips();
        t.setTripName(name);
        t.setStartTime("2026-05-05T08:00:00");
        t.setEndTime("2026-05-05T10:00:00");
        t.setStatus(Trips_Status.ONGOING);
        t.setDriver(driver);
        t.setVehicle(vehicle);
        return tripRepository.save(t);
    }

    // ─── GET /api/v1/trips ────────────────────────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/trips")
    class GetAllTrips {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with all trips")
        void returnsAllTrips() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with empty list when no trips exist")
        void returnsEmptyListWhenNoneExist() throws Exception {
            tripRepository.deleteAll();

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("each trip in list has expected fields")
        void eachTripHasExpectedFields() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].tripName",  notNullValue()))
                    .andExpect(jsonPath("$[0].startTime", notNullValue()))
                    .andExpect(jsonPath("$[0].driverId",  notNullValue()))
                    .andExpect(jsonPath("$[0].vehicleId", notNullValue()));
        }
    }

    // ─── GET /api/v1/trips/{id} ───────────────────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/trips/{id}")
    class GetTripById {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with correct trip fields")
        void returnsTripWhenFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/" + tripId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.tripName",  is("Morning Route")))
                    .andExpect(jsonPath("$.status",    is("COMPLETED")))
                    .andExpect(jsonPath("$.driverId",  is(driverId.intValue())))
                    .andExpect(jsonPath("$.vehicleId", is(vehicleId.intValue())));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when trip ID does not exist")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─── GET /api/v1/trips/driver/{driverId} ──────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/trips/driver/{driverId}")
    class GetTripsByDriver {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with all trips for a driver")
        void returnsTripsByDriver() throws Exception {
            seedTrip("Evening Route");

            mockMvc.perform(get(BASE_URL + "/driver/" + driverId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with single trip seeded in setUp")
        void returnsSingleTripFromSetUp() throws Exception {
            mockMvc.perform(get(BASE_URL + "/driver/" + driverId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].tripName", is("Morning Route")));
        }

        @Test
        @WithMockUser(roles = "DRIVER")
        @DisplayName("DRIVER role can access their own trips")
        void driverRoleCanAccessOwnTrips() throws Exception {
            mockMvc.perform(get(BASE_URL + "/driver/" + driverId))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when driver does not exist")
        void returns404WhenDriverNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/driver/99999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("each trip in result has correct driverId field")
        void eachTripHasCorrectDriverId() throws Exception {
            mockMvc.perform(get(BASE_URL + "/driver/" + driverId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].driverId", is(driverId.intValue())));
        }
    }

    // ─── POST /api/v1/trips ───────────────────────────────────────────────────
    @Nested
    @DisplayName("POST /api/v1/trips")
    class CreateTrip {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 201 and creates trip successfully")
        void createsTripSuccessfully() throws Exception {
            // Delete seeded trip so the driver is reusable (create allows same driver)
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createJson("New Route", "ONGOING")))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.tripName",  is("New Route")))
                    .andExpect(jsonPath("$.status",    is("ONGOING")))
                    .andExpect(jsonPath("$.driverId",  is(driverId.intValue())))
                    .andExpect(jsonPath("$.vehicleId", is(vehicleId.intValue())));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 201 and Location header pointing to new trip")
        void returnsLocationHeader() throws Exception {
            MvcResult result = mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createJson("Location Route", "ONGOING")))
                    .andExpect(status().isCreated())
                    .andReturn();

            String location = result.getResponse().getHeader("Location");
            assertThat(location).contains("/api/v1/trips/");
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("persists trip to database after POST")
        void persistsTripToDatabase() throws Exception {
            long countBefore = tripRepository.count();

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createJson("Persist Route", "ONGOING")))
                    .andExpect(status().isCreated());

            assertThat(tripRepository.count()).isEqualTo(countBefore + 1);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when tripName is missing")
        void returns400WhenTripNameMissing() throws Exception {
            String body = String.format("""
                    {
                      "startTime": "2026-05-04T08:00:00",
                      "status": "ONGOING",
                      "driver": { "id": %d },
                      "vehicle": { "vehicleId": %d }
                    }""", driverId, vehicleId);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when startTime is missing")
        void returns400WhenStartTimeMissing() throws Exception {
            String body = String.format("""
                    {
                      "tripName": "No Start",
                      "status": "ONGOING",
                      "driver": { "id": %d },
                      "vehicle": { "vehicleId": %d }
                    }""", driverId, vehicleId);

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
                      "tripName": "No Status",
                      "startTime": "2026-05-04T08:00:00",
                      "driver": { "id": %d },
                      "vehicle": { "vehicleId": %d }
                    }""", driverId, vehicleId);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when driver ID does not exist in DB")
        void returns400WhenDriverNotFound() throws Exception {
            String body = String.format("""
                    {
                      "tripName": "Bad Driver",
                      "startTime": "2026-05-04T08:00:00",
                      "status": "ONGOING",
                      "driver": { "id": 99999 },
                      "vehicle": { "vehicleId": %d }
                    }""", vehicleId);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when vehicle ID does not exist in DB")
        void returns400WhenVehicleNotFound() throws Exception {
            String body = String.format("""
                    {
                      "tripName": "Bad Vehicle",
                      "startTime": "2026-05-04T08:00:00",
                      "status": "ONGOING",
                      "driver": { "id": %d },
                      "vehicle": { "vehicleId": 99999 }
                    }""", driverId);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    // ─── PUT /api/v1/trips/{id} ───────────────────────────────────────────────
    @Nested
    @DisplayName("PUT /api/v1/trips/{id}")
    class UpdateTrip {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and updates tripName and status")
        void updatesTripSuccessfully() throws Exception {
            String body = """
                    {
                      "tripName": "Updated Route",
                      "status": "CANCELLED"
                    }""";

            mockMvc.perform(put(BASE_URL + "/" + tripId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.tripName", is("Updated Route")))
                    .andExpect(jsonPath("$.status",   is("CANCELLED")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("persists updated fields to database")
        void persistsUpdatesToDatabase() throws Exception {
            String body = """
                    {
                      "tripName": "DB Updated Route",
                      "status": "ONGOING"
                    }""";

            mockMvc.perform(put(BASE_URL + "/" + tripId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk());

            Trips fromDb = tripRepository.findById(tripId).orElseThrow();
            assertThat(fromDb.getTripName()).isEqualTo("DB Updated Route");
            assertThat(fromDb.getStatus()).isEqualTo(Trips_Status.ONGOING);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when trip to update does not exist")
        void returns404WhenTripNotFound() throws Exception {
            mockMvc.perform(put(BASE_URL + "/99999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    { "tripName": "Ghost Route" }
                                    """))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when new driver ID does not exist in DB")
        void returns400WhenNewDriverNotFound() throws Exception {
            String body = """
                    {
                      "driver": { "id": 99999 }
                    }""";

            mockMvc.perform(put(BASE_URL + "/" + tripId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when new vehicle ID does not exist in DB")
        void returns400WhenNewVehicleNotFound() throws Exception {
            String body = """
                    {
                      "vehicle": { "vehicleId": 99999 }
                    }""";

            mockMvc.perform(put(BASE_URL + "/" + tripId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("updates only startTime — other fields remain unchanged")
        void partialUpdatePreservesOtherFields() throws Exception {
            String body = """
                    {
                      "startTime": "2026-06-01T06:00:00"
                    }""";

            mockMvc.perform(put(BASE_URL + "/" + tripId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.startTime", is("2026-06-01T06:00:00")))
                    .andExpect(jsonPath("$.tripName",  is("Morning Route")));  // unchanged
        }
    }

    // ─── DELETE /api/v1/trips/{id} ────────────────────────────────────────────
    @Nested
    @DisplayName("DELETE /api/v1/trips/{id}")
    class DeleteTrip {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 204 and removes trip from database")
        void deletesTripSuccessfully() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/" + tripId))
                    .andExpect(status().isNoContent());

            assertThat(tripRepository.existsById(tripId)).isFalse();
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("driver and vehicle still exist after trip deletion")
        void driverAndVehicleStillExistAfterDeletion() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/" + tripId))
                    .andExpect(status().isNoContent());

            assertThat(driverRepository.existsById(driverId)).isTrue();
            assertThat(vehiclesRepository.existsById(vehicleId)).isTrue();
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when trip to delete does not exist")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("trip is truly gone — subsequent GET returns 404")
        void subsequentGetReturns404AfterDeletion() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/" + tripId))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get(BASE_URL + "/" + tripId))
                    .andExpect(status().isNotFound());
        }
    }
}
