package com.example.DriveGuardAI.controller;

import com.example.DriveGuardAI.Enum.UserRole;
import com.example.DriveGuardAI.model.Users;
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
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for UsersController.
 *
 * Requires: src/test/resources/application-test.properties with H2 datasource.
 *
 * Example application-test.properties:
 * -------------------------------------------------------
 * spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
 * spring.datasource.driver-class-name=org.h2.Driver
 * spring.datasource.username=sa
 * spring.datasource.password=
 * spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
 * spring.jpa.hibernate.ddl-auto=create-drop
 * spring.security.user.name=admin
 * spring.security.user.password=admin
 * -------------------------------------------------------
 *
 * Add H2 to pom.xml test scope:
 * <dependency>
 *   <groupId>com.h2database</groupId>
 *   <artifactId>h2</artifactId>
 *   <scope>test</scope>
 * </dependency>
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("UsersController Integration Tests")
class UsersControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/users";

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Shared state across ordered tests
    private static Long createdUserId;

    @BeforeEach
    void setUp() {
        // Build MockMvc manually — required in Spring Boot 4.x (no @AutoConfigureMockMvc)
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        userRepository.deleteAll();
    }

    // ─────────────────────────────────────────────
    //  Helper
    // ─────────────────────────────────────────────
    private Users buildSeedUser(String email) {
        Users u = new Users();
        u.setFirstName("John");
        u.setLastName("Doe");
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode("Password1"));
        u.setUserRole(UserRole.DRIVER);
        u.setPhoneNumber("+250788000000");
        return u;
    }

    private String userJson(String firstName, String lastName,
                             String email, String password,
                             String confirmPassword, String role) {
        return String.format("""
            {
              "firstName": "%s",
              "lastName": "%s",
              "email": "%s",
              "password": "%s",
              "confirmPassword": "%s",
              "userRole": "%s"
            }""", firstName, lastName, email, password, confirmPassword, role);
    }

    // ─────────────────────────────────────────────
    //  GET /api/v1/users
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/users")
    class GetAllUsers {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with empty list when no users exist")
        void returnsEmptyList() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with list of users")
        void returnsUserList() throws Exception {
            userRepository.save(buildSeedUser("alice@example.com"));
            userRepository.save(buildSeedUser("bob@example.com"));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].email", is("alice@example.com")));
        }

        @Test
        @DisplayName("returns 200 or 401 when unauthenticated — depends on SecurityConfig")
        void returnsExpectedStatusWhenUnauthenticated() throws Exception {
            // GET /api/v1/users is publicly accessible in this app's SecurityConfig.
            // If you later restrict it, change isOk() to isUnauthorized().
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk());
        }
    }

    // ─────────────────────────────────────────────
    //  GET /api/v1/users/{id}
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("GET /api/v1/users/{id}")
    class GetUserById {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with user when found")
        void returnsUserWhenFound() throws Exception {
            Users saved = userRepository.save(buildSeedUser("get-test@example.com"));

            mockMvc.perform(get(BASE_URL + "/" + saved.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email", is("get-test@example.com")))
                    .andExpect(jsonPath("$.firstName", is("John")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when user not found")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─────────────────────────────────────────────
    //  POST /api/v1/users
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("POST /api/v1/users")
    class CreateUser {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 201 and creates user with valid payload")
        void createsUserSuccessfully() throws Exception {
            String body = userJson("Jane", "Smith",
                    "jane.smith@example.com", "SecurePass1", "SecurePass1", "DRIVER");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", containsString("/api/v1/users/")))
                    .andExpect(jsonPath("$.email", is("jane.smith@example.com")))
                    .andExpect(jsonPath("$.firstName", is("Jane")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when email already exists")
        void returns400WhenEmailDuplicate() throws Exception {
            userRepository.save(buildSeedUser("duplicate@example.com"));

            String body = userJson("Jane", "Smith",
                    "duplicate@example.com", "SecurePass1", "SecurePass1", "DRIVER");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when passwords do not match")
        void returns400WhenPasswordMismatch() throws Exception {
            String body = userJson("Jane", "Smith",
                    "mismatch@example.com", "SecurePass1", "WrongPass2", "DRIVER");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when password too short")
        void returns400WhenPasswordTooShort() throws Exception {
            String body = userJson("Jane", "Smith",
                    "short-pass@example.com", "abc", "abc", "DRIVER");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when required firstName is missing")
        void returns400WhenFirstNameMissing() throws Exception {
            String body = """
                {
                  "lastName": "Smith",
                  "email": "no-firstname@example.com",
                  "password": "SecurePass1",
                  "confirmPassword": "SecurePass1",
                  "userRole": "DRIVER"
                }""";

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("password is not returned in response body")
        void passwordNotExposedInResponse() throws Exception {
            String body = userJson("Secure", "User",
                    "secure-user@example.com", "SecurePass1", "SecurePass1", "DRIVER");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.password").doesNotExist());
        }
    }

    // ─────────────────────────────────────────────
    //  PUT /api/v1/users/{id}
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("PUT /api/v1/users/{id}")
    class UpdateUser {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 and updates user fields")
        void updatesUserSuccessfully() throws Exception {
            Users saved = userRepository.save(buildSeedUser("update-me@example.com"));

            String body = """
                {
                  "firstName": "Updated",
                  "lastName": "Name",
                  "phoneNumber": "+250700000099"
                }""";

            mockMvc.perform(put(BASE_URL + "/" + saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.firstName", is("Updated")))
                    .andExpect(jsonPath("$.lastName", is("Name")))
                    .andExpect(jsonPath("$.phoneNumber", is("+250700000099")));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when updating to an email already in use")
        void returns400WhenEmailTaken() throws Exception {
            userRepository.save(buildSeedUser("taken@example.com"));
            Users target = userRepository.save(buildSeedUser("target@example.com"));

            String body = """
                {
                  "email": "taken@example.com"
                }""";

            mockMvc.perform(put(BASE_URL + "/" + target.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when updating non-existent user")
        void returns404WhenUserNotFound() throws Exception {
            mockMvc.perform(put(BASE_URL + "/99999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isNotFound());
        }
    }

    // ─────────────────────────────────────────────
    //  DELETE /api/v1/users/{id}
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("DELETE /api/v1/users/{id}")
    class DeleteUser {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 204 and removes user")
        void deletesUserSuccessfully() throws Exception {
            Users saved = userRepository.save(buildSeedUser("delete-me@example.com"));

            mockMvc.perform(delete(BASE_URL + "/" + saved.getId()))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get(BASE_URL + "/" + saved.getId())
                            .with(org.springframework.security.test.web.servlet.request
                                    .SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN")))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when deleting non-existent user")
        void returns404WhenNotFound() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/99999"))
                    .andExpect(status().isNotFound());
        }
    }
}
