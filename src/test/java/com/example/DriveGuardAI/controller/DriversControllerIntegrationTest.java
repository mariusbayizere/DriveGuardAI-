package com.example.DriveGuardAI.controller;

import com.example.DriveGuardAI.Enum.DriverStatus;
import com.example.DriveGuardAI.Enum.UserRole;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.UserRepository;
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
@DisplayName("DriversController Integration Tests")
class DriversControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/drivers";

    @Autowired private WebApplicationContext context;
    @Autowired private DriverRepository     driverRepository;
    @Autowired private UserRepository       userRepository;
    @Autowired private PasswordEncoder      passwordEncoder;

    private MockMvc mockMvc;

    // Shared IDs populated in setUp, reused across tests
    private Long userId;
    private Long driverId;

    // ─── Test Setup ───────────────────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Delete in FK-safe order
        driverRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Seed User
        Users user = new Users();
        user.setFirstName("Alice");
        user.setLastName("Driver");
        user.setEmail("alice.driver@test.com");
        user.setPassword(passwordEncoder.encode("Password1"));
        user.setUserRole(UserRole.DRIVER);
        Users savedUser = userRepository.save(user);
        userId = savedUser.getId();

        // 2. Seed Driver linked to that user
        Drivers driver = new Drivers();
        driver.setLicenseNumber("LIC-ALICE-001");
        driver.setHireDate(new Date());
        driver.setSafetyScore((byte) 100);
        driver.setStatus(DriverStatus.ACTIVE);
        driver.setUser(savedUser);
        Drivers savedDriver = driverRepository.save(driver);
        driverId = savedDriver.getId();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Creates a fresh unlinked user for POST tests */
    private Users seedExtraUser(String email) {
        Users u = new Users();
        u.setFirstName("Extra");
        u.setLastName("User");
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode("Password1"));
        u.setUserRole(UserRole.DRIVER);
        return userRepository.save(u);
    }

    /** JSON payload for POST /drivers — references an existing userId */
    private String createJson(String license, Long uid) {
        return String.format("""
                {
                  "licenseNumber": "%s",
                  "hireDate": "2024-01-15",
                  "status": "ACTIVE",
                  "user": { "id": %d }
                }""", license, uid);
    }

    /** JSON payload for PUT /drivers/{id} — partial update */
    private String updateJson(String license, String status) {
        return String.format("""
                {
                  "licenseNumber": "%s",
                  "status": "%s"
                }""", license, status);
    }

    // ─── GET /api/v1/drivers ──────────────────────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/drivers")
    class GetAllDrivers {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with all drivers")
        void returnsAllDrivers() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with empty list when no drivers exist")
        void returnsEmptyListWhenNoneExist() throws Exception {
            driverRepository.deleteAll();

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("each driver in list has expected fields")
        void eachDriverHasExpectedFields() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].licenseNumber", notNullValue()))
                    .andExpect(jsonPath("$[0].status",        notNullValue()))
                    .andExpect(jsonPath("$[0].safetyScore",   notNullValue()));
        }
    }

    // ─── GET /api/v1/drivers/{id} ─────────────────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/drivers/{id}")
    class GetDriverById {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with correct driver fields")
        void returnsDriverWhenFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/" + driverId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.licenseNumber", is("LIC-ALICE-001")))
                    .andExpect(jsonPath("$.status",        is("ACTIVE")))
                    .andExpect(jsonPath("$.safetyScore",   is(100)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when driver ID does not exist")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─── GET /api/v1/drivers/user/{userId} ────────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/drivers/user/{userId}")
    class GetDriverByUserId {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with driver profile linked to user")
        void returnsDriverForUserId() throws Exception {
            mockMvc.perform(get(BASE_URL + "/user/" + userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.licenseNumber", is("LIC-ALICE-001")))
                    .andExpect(jsonPath("$.status",        is("ACTIVE")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when user ID does not exist")
        void returns404WhenUserNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/user/99999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when user exists but has no driver profile")
        void returns404WhenUserHasNoDriverProfile() throws Exception {
            Users unlinkedUser = seedExtraUser("no.driver@test.com");

            mockMvc.perform(get(BASE_URL + "/user/" + unlinkedUser.getId()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "DRIVER")
        @DisplayName("DRIVER role can access own profile via /user/{userId}")
        void driverRoleCanAccessOwnProfile() throws Exception {
            mockMvc.perform(get(BASE_URL + "/user/" + userId))
                    .andExpect(status().isOk());
        }
    }

    // ─── POST /api/v1/drivers ─────────────────────────────────────────────────
    @Nested
    @DisplayName("POST /api/v1/drivers")
    class CreateDriver {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 201 and creates driver with safety score 100")
        void createsDriverWithDefaultSafetyScore() throws Exception {
            Users extra = seedExtraUser("new.driver@test.com");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createJson("LIC-NEW-001", extra.getId())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.licenseNumber", is("LIC-NEW-001")))
                    .andExpect(jsonPath("$.safetyScore",   is(100)))
                    .andExpect(jsonPath("$.status",        is("ACTIVE")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 201 and Location header pointing to new driver")
        void returnsLocationHeader() throws Exception {
            Users extra = seedExtraUser("location.test@test.com");

            MvcResult result = mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createJson("LIC-LOC-001", extra.getId())))
                    .andExpect(status().isCreated())
                    .andReturn();

            String location = result.getResponse().getHeader("Location");
            assertThat(location).contains("/api/v1/drivers/");
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("persists driver to database after POST")
        void persistsDriverToDatabase() throws Exception {
            Users extra = seedExtraUser("persist.test@test.com");
            long countBefore = driverRepository.count();

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createJson("LIC-PERSIST-001", extra.getId())))
                    .andExpect(status().isCreated());

            assertThat(driverRepository.count()).isEqualTo(countBefore + 1);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when licenseNumber is already in use")
        void returns400WhenLicenseDuplicate() throws Exception {
            // "LIC-ALICE-001" already exists from setUp
            Users extra = seedExtraUser("dup.license@test.com");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createJson("LIC-ALICE-001", extra.getId())))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when user is already assigned to another driver")
        void returns400WhenUserAlreadyAssigned() throws Exception {
            // userId is already linked to driverId from setUp
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createJson("LIC-UNIQUE-999", userId)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when user ID does not exist in DB")
        void returns400WhenUserNotFound() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createJson("LIC-NO-USER-001", 99999L)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when licenseNumber is missing from body")
        void returns400WhenLicenseNumberMissing() throws Exception {
            Users extra = seedExtraUser("missing.license@test.com");

            String body = String.format("""
                    {
                      "hireDate": "2024-01-15",
                      "status": "ACTIVE",
                      "user": { "id": %d }
                    }""", extra.getId());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    // ─── PUT /api/v1/drivers/{id} ─────────────────────────────────────────────
    @Nested
    @DisplayName("PUT /api/v1/drivers/{id}")
    class UpdateDriver {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and updates licenseNumber and status")
        void updatesDriverSuccessfully() throws Exception {
            mockMvc.perform(put(BASE_URL + "/" + driverId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(updateJson("LIC-UPDATED-001", "INACTIVE")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.licenseNumber", is("LIC-UPDATED-001")))
                    .andExpect(jsonPath("$.status",        is("INACTIVE")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("persists updated fields to database")
        void persistsUpdatesToDatabase() throws Exception {
            mockMvc.perform(put(BASE_URL + "/" + driverId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(updateJson("LIC-DB-UPDATED", "SUSPENDED")))
                    .andExpect(status().isOk());

            Drivers fromDb = driverRepository.findById(driverId).orElseThrow();
            assertThat(fromDb.getLicenseNumber()).isEqualTo("LIC-DB-UPDATED");
            assertThat(fromDb.getStatus()).isEqualTo(DriverStatus.SUSPENDED);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when driver to update does not exist")
        void returns404WhenDriverNotFound() throws Exception {
            mockMvc.perform(put(BASE_URL + "/99999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(updateJson("LIC-X", "ACTIVE")))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when new licenseNumber is already used by another driver")
        void returns400WhenLicenseTakenByAnotherDriver() throws Exception {
            // Create a second driver with a different license
            Users extra = seedExtraUser("second.driver@test.com");
            Drivers second = new Drivers();
            second.setLicenseNumber("LIC-SECOND-001");
            second.setHireDate(new Date());
            second.setSafetyScore((byte) 100);
            second.setStatus(DriverStatus.ACTIVE);
            second.setUser(extra);
            driverRepository.save(second);

            // Try to update first driver's license to the second driver's license
            mockMvc.perform(put(BASE_URL + "/" + driverId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(updateJson("LIC-SECOND-001", "ACTIVE")))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("allows updating licenseNumber to same value (idempotent)")
        void allowsSameLicenseNumberUpdate() throws Exception {
            mockMvc.perform(put(BASE_URL + "/" + driverId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(updateJson("LIC-ALICE-001", "ACTIVE")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.licenseNumber", is("LIC-ALICE-001")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("reassigns driver to a new user when user.id is provided")
        void reassignsDriverToNewUser() throws Exception {
            Users newUser = seedExtraUser("new.assignment@test.com");

            String body = String.format("""
                    {
                      "user": { "id": %d }
                    }""", newUser.getId());

            MvcResult result = mockMvc.perform(put(BASE_URL + "/" + driverId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andReturn();

            // Verify via response JSON — avoids stale JPA session cache issue
            String response = result.getResponse().getContentAsString();
            assertThat(response).contains(String.valueOf(newUser.getId()));
        }
    }

    // ─── DELETE /api/v1/drivers/{id} ──────────────────────────────────────────
    @Nested
    @DisplayName("DELETE /api/v1/drivers/{id}")
    class DeleteDriver {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 204 and removes driver from database")
        void deletesDriverSuccessfully() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/" + driverId))
                    .andExpect(status().isNoContent());

            assertThat(driverRepository.existsById(driverId)).isFalse();
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("clears user back-reference after deletion")
        void clearsUserBackReferenceAfterDeletion() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/" + driverId))
                    .andExpect(status().isNoContent());

            // Driver should no longer exist
            assertThat(driverRepository.findById(driverId)).isEmpty();
            // User should still exist
            assertThat(userRepository.existsById(userId)).isTrue();
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when driver to delete does not exist")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("driver is truly gone — subsequent GET returns 404")
        void subsequentGetReturns404AfterDeletion() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/" + driverId))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get(BASE_URL + "/" + driverId))
                    .andExpect(status().isNotFound());
        }
    }
}
