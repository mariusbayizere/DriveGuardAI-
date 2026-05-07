package com.example.DriveGuardAI.controller;

import com.example.DriveGuardAI.Enum.UserRole;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.UserRepository;
import com.example.DriveGuardAI.SecurityConfig.JwtProvider;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for UserAutho controller (/api/v1/auth).
 *
 * Covers:
 *   POST /api/v1/auth/signup
 *   POST /api/v1/auth/signin
 *   PUT  /api/v1/auth/update-password
 *   GET  /api/v1/auth/me
 *
 * Uses H2 in-memory DB via src/test/resources/application-test.properties.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("UserAutho Integration Tests")
class UserAuthoIntegrationTest {

    private static final String BASE_URL = "/api/v1/auth";

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository        userRepository;
    @Autowired private PasswordEncoder       passwordEncoder;

    private MockMvc mockMvc;

    // ─────────────────────────────────────────────
    //  Setup / teardown
    // ─────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        userRepository.deleteAll();
    }

    // ─────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────

    /** Persist a user directly, bypassing the auth endpoint. */
    private Users seedUser(String email, String rawPassword, UserRole role) {
        Users u = new Users();
        u.setFirstName("Test");
        u.setLastName("User");
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setUserRole(role);
        u.setPhoneNumber("+250788000000");
        return userRepository.save(u);
    }

    /** Generate a valid JWT for a seeded user (bypasses sign-in endpoint). */
    private String jwtFor(String email, UserRole role) {
        var auth = new UsernamePasswordAuthenticationToken(
                email, null,
                AuthorityUtils.createAuthorityList(role.name()));
        return JwtProvider.generateToken(auth);
    }

    private String signupJson(String firstName, String lastName,
                               String email, String password,
                               String confirmPassword, String role) {
        return String.format("""
            {
              "firstName": "%s",
              "lastName":  "%s",
              "email":     "%s",
              "password":  "%s",
              "confirmPassword": "%s",
              "userRole":  "%s"
            }""", firstName, lastName, email, password, confirmPassword, role);
    }

    private String signinJson(String email, String password) {
        return String.format("""
            {
              "email":    "%s",
              "password": "%s"
            }""", email, password);
    }

    private String updatePasswordJson(String email, String newPassword, String confirmPassword) {
        return String.format("""
            {
              "email":           "%s",
              "newPassword":     "%s",
              "confirmPassword": "%s"
            }""", email, newPassword, confirmPassword);
    }

    // ═════════════════════════════════════════════
    //  POST /api/v1/auth/signup
    // ═════════════════════════════════════════════

    @Nested
    @DisplayName("POST /api/v1/auth/signup")
    class Signup {

        @Test
        @DisplayName("returns 200 and JWT token when registration is successful")
        void registersSuccessfully() throws Exception {
            String body = signupJson("Alice", "Wonder",
                    "alice@example.com", "SecurePass1", "SecurePass1", "DRIVER");

            mockMvc.perform(post(BASE_URL + "/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status",  is(true)))
                    .andExpect(jsonPath("$.message", is("Register Success")))
                    .andExpect(jsonPath("$.jwt",     notNullValue()));
        }

        @Test
        @DisplayName("returns 400 when email is already registered")
        void returns400WhenEmailAlreadyUsed() throws Exception {
            seedUser("existing@example.com", "Password1", UserRole.DRIVER);

            String body = signupJson("Alice", "Wonder",
                    "existing@example.com", "SecurePass1", "SecurePass1", "DRIVER");

            mockMvc.perform(post(BASE_URL + "/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status",  is(false)))
                    .andExpect(jsonPath("$.message", containsString("Email is already used")));
        }

        @Test
        @DisplayName("returns 400 when password is null")
        void returns400WhenPasswordNull() throws Exception {
            String body = """
                {
                  "firstName": "Alice",
                  "lastName":  "Wonder",
                  "email":     "alice2@example.com",
                  "userRole":  "DRIVER"
                }""";

            mockMvc.perform(post(BASE_URL + "/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(false)));
        }

        @Test
        @DisplayName("returns 400 when confirmPassword is null")
        void returns400WhenConfirmPasswordNull() throws Exception {
            String body = """
                {
                  "firstName": "Alice",
                  "lastName":  "Wonder",
                  "email":     "alice3@example.com",
                  "password":  "SecurePass1",
                  "userRole":  "DRIVER"
                }""";

            mockMvc.perform(post(BASE_URL + "/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(false)));
        }

        @Test
        @DisplayName("returns 400 when passwords do not match")
        void returns400WhenPasswordsMismatch() throws Exception {
            String body = signupJson("Alice", "Wonder",
                    "alice4@example.com", "SecurePass1", "WrongPass2", "DRIVER");

            mockMvc.perform(post(BASE_URL + "/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status",  is(false)))
                    .andExpect(jsonPath("$.message", containsString("Passwords do not match")));
        }

        @Test
        @DisplayName("password is never returned in the signup response")
        void passwordNotExposedInSignupResponse() throws Exception {
            String body = signupJson("Alice", "Wonder",
                    "alice5@example.com", "SecurePass1", "SecurePass1", "DRIVER");

            mockMvc.perform(post(BASE_URL + "/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.password").doesNotExist());
        }
    }

    // ═════════════════════════════════════════════
    //  POST /api/v1/auth/signin
    // ═════════════════════════════════════════════

    @Nested
    @DisplayName("POST /api/v1/auth/signin")
    class Signin {

        @Test
        @DisplayName("returns 200 and JWT token with valid credentials")
        void signInSuccessfully() throws Exception {
            seedUser("login@example.com", "CorrectPass1", UserRole.DRIVER);

            String body = signinJson("login@example.com", "CorrectPass1");

            mockMvc.perform(post(BASE_URL + "/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status",  is(true)))
                    .andExpect(jsonPath("$.message", is("Signin Success")))
                    .andExpect(jsonPath("$.jwt",     notNullValue()));
        }

        @Test
        @DisplayName("returns 401 when password is wrong")
        void returns401WhenPasswordWrong() throws Exception {
            seedUser("login2@example.com", "CorrectPass1", UserRole.DRIVER);

            String body = signinJson("login2@example.com", "WrongPassword");

            mockMvc.perform(post(BASE_URL + "/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status",  is(false)))
                    .andExpect(jsonPath("$.message", containsString("Invalid username or password")));
        }

        @Test
        @DisplayName("returns 401 when email does not exist")
        void returns401WhenEmailNotRegistered() throws Exception {
            String body = signinJson("ghost@example.com", "SomePass123");

            mockMvc.perform(post(BASE_URL + "/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(false)));
        }

        @Test
        @DisplayName("returns 400 when email field is missing")
        void returns400WhenEmailMissing() throws Exception {
            String body = """
                {
                  "password": "SomePass123"
                }""";

            mockMvc.perform(post(BASE_URL + "/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(false)));
        }

        @Test
        @DisplayName("returns 400 when password field is missing")
        void returns400WhenPasswordMissing() throws Exception {
            String body = """
                {
                  "email": "someone@example.com"
                }""";

            mockMvc.perform(post(BASE_URL + "/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(false)));
        }

        @Test
        @DisplayName("JWT token in response is a non-blank string")
        void jwtTokenIsNonBlank() throws Exception {
            seedUser("jwt-check@example.com", "ValidPass1", UserRole.MANAGER);

            String body = signinJson("jwt-check@example.com", "ValidPass1");

            mockMvc.perform(post(BASE_URL + "/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.jwt", not(emptyOrNullString())));
        }
    }

    // ═════════════════════════════════════════════
    //  PUT /api/v1/auth/update-password
    // ═════════════════════════════════════════════

    @Nested
    @DisplayName("PUT /api/v1/auth/update-password")
    class UpdatePassword {

        @Test
        @DisplayName("returns 200 when password is updated successfully")
        void updatesPasswordSuccessfully() throws Exception {
            seedUser("update-pw@example.com", "OldPass123", UserRole.DRIVER);

            String body = updatePasswordJson(
                    "update-pw@example.com", "NewPass456", "NewPass456");

            mockMvc.perform(put(BASE_URL + "/update-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status",  is(true)))
                    .andExpect(jsonPath("$.message", is("Password updated successfully")));
        }

        @Test
        @DisplayName("can sign in with new password after update")
        void canSignInWithNewPasswordAfterUpdate() throws Exception {
            seedUser("pw-reuse@example.com", "OldPass123", UserRole.DRIVER);

            // Change password
            mockMvc.perform(put(BASE_URL + "/update-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(updatePasswordJson(
                                    "pw-reuse@example.com", "BrandNew99", "BrandNew99")))
                    .andExpect(status().isOk());

            // Sign in with new password
            mockMvc.perform(post(BASE_URL + "/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(signinJson("pw-reuse@example.com", "BrandNew99")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is(true)));
        }

        @Test
        @DisplayName("returns 404 when email does not match any account")
        void returns404WhenEmailNotFound() throws Exception {
            String body = updatePasswordJson(
                    "nobody@example.com", "NewPass456", "NewPass456");

            mockMvc.perform(put(BASE_URL + "/update-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status", is(false)));
        }

        @Test
        @DisplayName("returns 400 when email field is blank")
        void returns400WhenEmailBlank() throws Exception {
            String body = updatePasswordJson("", "NewPass456", "NewPass456");

            mockMvc.perform(put(BASE_URL + "/update-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", containsString("Email is required")));
        }

        @Test
        @DisplayName("returns 400 when newPassword field is blank")
        void returns400WhenNewPasswordBlank() throws Exception {
            String body = updatePasswordJson("someone@example.com", "", "NewPass456");

            mockMvc.perform(put(BASE_URL + "/update-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", containsString("New password is required")));
        }

        @Test
        @DisplayName("returns 400 when confirmPassword field is blank")
        void returns400WhenConfirmPasswordBlank() throws Exception {
            String body = updatePasswordJson("someone@example.com", "NewPass456", "");

            mockMvc.perform(put(BASE_URL + "/update-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", containsString("Confirm password is required")));
        }

        @Test
        @DisplayName("returns 400 when new passwords do not match")
        void returns400WhenPasswordsMismatch() throws Exception {
            seedUser("mismatch-pw@example.com", "OldPass123", UserRole.DRIVER);

            String body = updatePasswordJson(
                    "mismatch-pw@example.com", "NewPass456", "DifferentPass");

            mockMvc.perform(put(BASE_URL + "/update-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status",  is(false)))
                    .andExpect(jsonPath("$.message", containsString("Passwords do not match")));
        }

        @Test
        @DisplayName("returns 400 when new password is too short (less than 8 chars)")
        void returns400WhenNewPasswordTooShort() throws Exception {
            seedUser("short-pw@example.com", "OldPass123", UserRole.DRIVER);

            String body = updatePasswordJson("short-pw@example.com", "abc", "abc");

            mockMvc.perform(put(BASE_URL + "/update-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(false)));
        }
    }

    // ═════════════════════════════════════════════
    //  GET /api/v1/auth/me
    // ═════════════════════════════════════════════

    @Nested
    @DisplayName("GET /api/v1/auth/me")
    class GetCurrentUser {

        @Test
        @DisplayName("returns 200 with user details when JWT is valid")
        void returnsCurrentUserWithValidJwt() throws Exception {
            Users saved = seedUser("me@example.com", "Password1", UserRole.MANAGER);
            String token = jwtFor(saved.getEmail(), saved.getUserRole());

            mockMvc.perform(get(BASE_URL + "/me")
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email",     is("me@example.com")))
                    .andExpect(jsonPath("$.firstName", is("Test")))
                    .andExpect(jsonPath("$.lastName",  is("User")))
                    .andExpect(jsonPath("$.role",      is("MANAGER")))
                    .andExpect(jsonPath("$.id",        notNullValue()));
        }

        @Test
        @DisplayName("response does not contain password field")
        void passwordNotExposedInMeResponse() throws Exception {
            Users saved = seedUser("me2@example.com", "Password1", UserRole.DRIVER);
            String token = jwtFor(saved.getEmail(), saved.getUserRole());

            mockMvc.perform(get(BASE_URL + "/me")
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.password").doesNotExist());
        }

        @Test
        @DisplayName("rejects request when Authorization header is missing")
        void rejectsWhenNoHeader() throws Exception {
            // @RequestHeader("Authorization") causes Spring to throw before the method
            // body runs. Depending on exception handler config this can be 400, 401,
            // or 500 — but it must never be 200 OK.
            int responseStatus = mockMvc.perform(get(BASE_URL + "/me"))
                    .andReturn()
                    .getResponse()
                    .getStatus();

            org.assertj.core.api.Assertions.assertThat(responseStatus)
                    .as("Missing Authorization header must not return 200 OK")
                    .isNotEqualTo(200);
        }

        @Test
        @DisplayName("returns 4xx when token is malformed")
        void returns4xxWhenTokenMalformed() throws Exception {
            // A malformed JWT may be caught by the JWT filter before reaching the
            // controller, producing a plain Spring error rather than AuthResponse JSON.
            // We only assert that the request is rejected (not 200 OK).
            mockMvc.perform(get(BASE_URL + "/me")
                            .header("Authorization", "Bearer this.is.not.a.valid.jwt"))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("returns 401 when token is just a random string (no Bearer prefix logic)")
        void returns401WhenTokenIsGarbage() throws Exception {
            mockMvc.perform(get(BASE_URL + "/me")
                            .header("Authorization", "Bearer garbage_token_xyz"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("returns correct role in /me response for ADMIN user")
        void returnsCorrectRoleForAdminUser() throws Exception {
            Users admin = seedUser("admin@example.com", "AdminPass1", UserRole.ADMIN);
            String token = jwtFor(admin.getEmail(), admin.getUserRole());

            mockMvc.perform(get(BASE_URL + "/me")
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role", is("ADMIN")));
        }
    }
}
