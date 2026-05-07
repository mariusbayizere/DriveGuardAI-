package com.example.DriveGuardAI.service;

import com.example.DriveGuardAI.Enum.UserRole;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UsersService Unit Tests")
class UsersServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsersService usersService;

    private Users validUser;

    @BeforeEach
    void setUp() {
        validUser = new Users();
        validUser.setId(1L);
        validUser.setFirstName("John");
        validUser.setLastName("Doe");
        validUser.setEmail("john.doe@example.com");
        validUser.setPassword("hashedPassword123");
        validUser.setPhoneNumber("+250788000000");
        validUser.setUserRole(UserRole.DRIVER);
    }

    // ─────────────────────────────────────────────
    //  findAll
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("findAll()")
    class FindAll {

        @Test
        @DisplayName("returns all users from repository")
        void returnsAllUsers() {
            when(userRepository.findAll()).thenReturn(List.of(validUser));

            List<Users> result = usersService.findAll();

            assertThat(result).hasSize(1).contains(validUser);
            verify(userRepository).findAll();
        }

        @Test
        @DisplayName("returns empty list when no users exist")
        void returnsEmptyList() {
            when(userRepository.findAll()).thenReturn(List.of());

            List<Users> result = usersService.findAll();

            assertThat(result).isEmpty();
        }
    }

    // ─────────────────────────────────────────────
    //  findById
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("findById()")
    class FindById {

        @Test
        @DisplayName("returns user when found")
        void returnsUserWhenFound() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));

            Users result = usersService.findById(1L);

            assertThat(result).isEqualTo(validUser);
        }

        @Test
        @DisplayName("throws 404 when user not found")
        void throwsNotFoundWhenMissing() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> usersService.findById(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User not found");
        }
    }

    // ─────────────────────────────────────────────
    //  create
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("create()")
    class Create {

        private Users newUser;

        @BeforeEach
        void setup() {
            newUser = new Users();
            newUser.setFirstName("Jane");
            newUser.setLastName("Smith");
            newUser.setEmail("jane.smith@example.com");
            newUser.setPassword("Secret123");
            newUser.setConfirmPassword("Secret123");
            newUser.setUserRole(UserRole.MANAGER);
        }

        @Test
        @DisplayName("creates user successfully with valid data")
        void createsUserSuccessfully() {
            when(userRepository.findByEmail(newUser.getEmail())).thenReturn(Optional.empty());
            when(passwordEncoder.encode("Secret123")).thenReturn("encodedSecret");
            when(userRepository.save(any(Users.class))).thenAnswer(inv -> {
                Users u = inv.getArgument(0);
                u.setId(2L);
                return u;
            });

            Users result = usersService.create(newUser);

            assertThat(result.getId()).isEqualTo(2L);
            assertThat(result.getPassword()).isEqualTo("encodedSecret");
            assertThat(result.getConfirmPassword()).isNull();
            verify(passwordEncoder).encode("Secret123");
            verify(userRepository).save(any(Users.class));
        }

        @Test
        @DisplayName("throws 400 when email is blank")
        void throwsWhenEmailBlank() {
            newUser.setEmail("   ");

            assertThatThrownBy(() -> usersService.create(newUser))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Email is required");
        }

        @Test
        @DisplayName("throws 400 when email is null")
        void throwsWhenEmailNull() {
            newUser.setEmail(null);

            assertThatThrownBy(() -> usersService.create(newUser))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Email is required");
        }

        @Test
        @DisplayName("throws 400 when email already exists")
        void throwsWhenEmailAlreadyExists() {
            when(userRepository.findByEmail(newUser.getEmail())).thenReturn(Optional.of(validUser));

            assertThatThrownBy(() -> usersService.create(newUser))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Email already exists");
        }

        @Test
        @DisplayName("throws 400 when password is blank")
        void throwsWhenPasswordBlank() {
            newUser.setPassword("  ");
            when(userRepository.findByEmail(newUser.getEmail())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> usersService.create(newUser))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Password is required");
        }

        @Test
        @DisplayName("throws 400 when password is too short")
        void throwsWhenPasswordTooShort() {
            newUser.setPassword("short");
            newUser.setConfirmPassword("short");
            when(userRepository.findByEmail(newUser.getEmail())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> usersService.create(newUser))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Password must be at least 8 characters");
        }

        @Test
        @DisplayName("throws 400 when passwords do not match")
        void throwsWhenPasswordsMismatch() {
            newUser.setConfirmPassword("DifferentPass1");
            when(userRepository.findByEmail(newUser.getEmail())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> usersService.create(newUser))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Passwords do not match");
        }

        @Test
        @DisplayName("throws 400 when confirmPassword is null")
        void throwsWhenConfirmPasswordNull() {
            newUser.setConfirmPassword(null);
            when(userRepository.findByEmail(newUser.getEmail())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> usersService.create(newUser))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Passwords do not match");
        }

        @Test
        @DisplayName("forces id to null before saving (prevents override)")
        void forcesIdToNullBeforeSave() {
            newUser.setId(999L); // attacker-supplied id
            when(userRepository.findByEmail(newUser.getEmail())).thenReturn(Optional.empty());
            when(passwordEncoder.encode(any())).thenReturn("encoded");
            when(userRepository.save(any(Users.class))).thenAnswer(inv -> inv.getArgument(0));

            usersService.create(newUser);

            verify(userRepository).save(argThat(u -> u.getId() == null));
        }
    }

    // ─────────────────────────────────────────────
    //  update
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("update()")
    class Update {

        @Test
        @DisplayName("updates allowed fields successfully")
        void updatesFieldsSuccessfully() {
            Users payload = new Users();
            payload.setFirstName("UpdatedFirst");
            payload.setLastName("UpdatedLast");
            payload.setPhoneNumber("+250700000001");
            payload.setUserRole(UserRole.ADMIN);

            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));
            when(userRepository.save(any(Users.class))).thenAnswer(inv -> inv.getArgument(0));

            Users result = usersService.update(1L, payload);

            assertThat(result.getFirstName()).isEqualTo("UpdatedFirst");
            assertThat(result.getLastName()).isEqualTo("UpdatedLast");
            assertThat(result.getPhoneNumber()).isEqualTo("+250700000001");
            assertThat(result.getUserRole()).isEqualTo(UserRole.ADMIN);
        }

        @Test
        @DisplayName("updates email when new email is unique")
        void updatesEmailWhenUnique() {
            Users payload = new Users();
            payload.setEmail("new.email@example.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));
            when(userRepository.findByEmail("new.email@example.com")).thenReturn(Optional.empty());
            when(userRepository.save(any(Users.class))).thenAnswer(inv -> inv.getArgument(0));

            Users result = usersService.update(1L, payload);

            assertThat(result.getEmail()).isEqualTo("new.email@example.com");
        }

        @Test
        @DisplayName("throws 400 when new email is already in use")
        void throwsWhenNewEmailTaken() {
            Users payload = new Users();
            payload.setEmail("taken@example.com");

            Users other = new Users();
            other.setId(2L);
            other.setEmail("taken@example.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));
            when(userRepository.findByEmail("taken@example.com")).thenReturn(Optional.of(other));

            assertThatThrownBy(() -> usersService.update(1L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Email already in use");
        }

        @Test
        @DisplayName("updates password when valid and confirmed")
        void updatesPasswordWhenValid() {
            Users payload = new Users();
            payload.setPassword("NewPass123");
            payload.setConfirmPassword("NewPass123");

            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));
            when(passwordEncoder.encode("NewPass123")).thenReturn("encodedNew");
            when(userRepository.save(any(Users.class))).thenAnswer(inv -> inv.getArgument(0));

            Users result = usersService.update(1L, payload);

            assertThat(result.getPassword()).isEqualTo("encodedNew");
        }

        @Test
        @DisplayName("throws 400 when new password is too short")
        void throwsWhenNewPasswordTooShort() {
            Users payload = new Users();
            payload.setPassword("short");
            payload.setConfirmPassword("short");

            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));

            assertThatThrownBy(() -> usersService.update(1L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Password must be at least 8 characters");
        }

        @Test
        @DisplayName("throws 400 when new passwords do not match")
        void throwsWhenNewPasswordsMismatch() {
            Users payload = new Users();
            payload.setPassword("ValidPass123");
            payload.setConfirmPassword("WrongPass456");

            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));

            assertThatThrownBy(() -> usersService.update(1L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Passwords do not match");
        }

        @Test
        @DisplayName("throws 404 when user to update does not exist")
        void throwsWhenUserNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> usersService.update(99L, new Users()))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("does not update email when payload email equals current email")
        void doesNotUpdateSameEmail() {
            Users payload = new Users();
            payload.setEmail(validUser.getEmail()); // same email

            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));
            when(userRepository.save(any(Users.class))).thenAnswer(inv -> inv.getArgument(0));

            Users result = usersService.update(1L, payload);

            // findByEmail should NOT be called since email is unchanged
            verify(userRepository, never()).findByEmail(any());
            assertThat(result.getEmail()).isEqualTo(validUser.getEmail());
        }
    }

    // ─────────────────────────────────────────────
    //  delete
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("deletes user when found")
        void deletesUserWhenFound() {
            when(userRepository.existsById(1L)).thenReturn(true);

            usersService.delete(1L);

            verify(userRepository).deleteById(1L);
        }

        @Test
        @DisplayName("throws 404 when user to delete not found")
        void throwsWhenUserNotFound() {
            when(userRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> usersService.delete(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User not found");

            verify(userRepository, never()).deleteById(any());
        }
    }

    // ─────────────────────────────────────────────
    //  updatePassword
    // ─────────────────────────────────────────────
    @Nested
    @DisplayName("updatePassword()")
    class UpdatePassword {

        @Test
        @DisplayName("updates password successfully")
        void updatesPasswordSuccessfully() {
            when(userRepository.findByEmail(validUser.getEmail())).thenReturn(Optional.of(validUser));
            when(passwordEncoder.encode("NewPass123")).thenReturn("encodedNewPass");

            usersService.updatePassword(validUser.getEmail(), "NewPass123", "NewPass123");

            verify(passwordEncoder).encode("NewPass123");
            verify(userRepository).save(argThat(u ->
                    u.getPassword().equals("encodedNewPass") && u.getConfirmPassword() == null));
        }

        @Test
        @DisplayName("throws 404 when email not found")
        void throwsWhenEmailNotFound() {
            when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                usersService.updatePassword("ghost@example.com", "Pass1234", "Pass1234"))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("No account found with that email address");
        }

        @Test
        @DisplayName("throws 400 when new password is blank")
        void throwsWhenNewPasswordBlank() {
            when(userRepository.findByEmail(validUser.getEmail())).thenReturn(Optional.of(validUser));

            assertThatThrownBy(() ->
                usersService.updatePassword(validUser.getEmail(), "  ", "  "))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("New password is required");
        }

        @Test
        @DisplayName("throws 400 when new password too short")
        void throwsWhenNewPasswordTooShort() {
            when(userRepository.findByEmail(validUser.getEmail())).thenReturn(Optional.of(validUser));

            assertThatThrownBy(() ->
                usersService.updatePassword(validUser.getEmail(), "short", "short"))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Password must be at least 8 characters");
        }

        @Test
        @DisplayName("throws 400 when passwords do not match")
        void throwsWhenPasswordsMismatch() {
            when(userRepository.findByEmail(validUser.getEmail())).thenReturn(Optional.of(validUser));

            assertThatThrownBy(() ->
                usersService.updatePassword(validUser.getEmail(), "ValidPass1", "DifferentPass"))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Passwords do not match");
        }
    }
}
