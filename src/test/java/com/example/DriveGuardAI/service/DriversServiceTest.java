package com.example.DriveGuardAI.service;

import com.example.DriveGuardAI.Enum.DriverStatus;
import com.example.DriveGuardAI.Enum.UserRole;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DriversService Unit Tests")
class DriversServiceTest {

    @Mock private DriverRepository driverRepository;
    @Mock private UserRepository   userRepository;

    @InjectMocks
    private DriversService driversService;

    // ─── Seed helpers ─────────────────────────────────────────────────────────

    private Users user(Long id) {
        Users u = new Users();
        u.setId(id);
        u.setFirstName("John");
        u.setLastName("Doe");
        u.setEmail("john.doe@test.com");
        u.setPassword("encoded-password");
        u.setUserRole(UserRole.DRIVER);
        return u;
    }

    private Drivers driver(Long id, Users user) {
        Drivers d = new Drivers();
        d.setId(id);
        d.setLicenseNumber("LIC-" + id);
        d.setHireDate(new Date());
        d.setSafetyScore((byte) 100);
        d.setStatus(DriverStatus.ACTIVE);
        d.setUser(user);
        return d;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  findAll
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("findAll()")
    class FindAll {

        @Test
        @DisplayName("returns all drivers from repository")
        void returnsAllDrivers() {
            Users u = user(1L);
            when(driverRepository.findAll()).thenReturn(List.of(driver(1L, u), driver(2L, u)));

            assertThat(driversService.findAll()).hasSize(2);
            verify(driverRepository).findAll();
        }

        @Test
        @DisplayName("returns empty list when no drivers exist")
        void returnsEmptyList() {
            when(driverRepository.findAll()).thenReturn(List.of());

            assertThat(driversService.findAll()).isEmpty();
            verify(driverRepository).findAll();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  findById
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("findById()")
    class FindById {

        @Test
        @DisplayName("returns driver when found by driver PK")
        void returnsDriverWhenFound() {
            Users u = user(1L);
            Drivers d = driver(1L, u);
            when(driverRepository.findById(1L)).thenReturn(Optional.of(d));

            Drivers result = driversService.findById(1L);

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getLicenseNumber()).isEqualTo("LIC-1");
        }

        @Test
        @DisplayName("throws 404 ResponseStatusException when driver not found")
        void throwsWhenNotFound() {
            when(driverRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> driversService.findById(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver not found");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  findByUserId
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("findByUserId()")
    class FindByUserId {

        @Test
        @DisplayName("returns driver linked to given user ID")
        void returnsDriverForUserId() {
            Users u = user(14L);
            Drivers d = driver(1L, u);
            u.setDriver(d);
            when(userRepository.findById(14L)).thenReturn(Optional.of(u));

            Drivers result = driversService.findByUserId(14L);

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getUser().getId()).isEqualTo(14L);
        }

        @Test
        @DisplayName("throws 404 when user not found")
        void throwsWhenUserNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> driversService.findByUserId(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User not found with id: 99");
        }

        @Test
        @DisplayName("throws 404 when user exists but has no driver profile")
        void throwsWhenUserHasNoDriverProfile() {
            Users u = user(5L);
            u.setDriver(null); // user exists but is not linked to any driver
            when(userRepository.findById(5L)).thenReturn(Optional.of(u));

            assertThatThrownBy(() -> driversService.findByUserId(5L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("No driver profile linked to user id: 5");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  create
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("saves driver with DEFAULT safety score of 100 regardless of input")
        void setsDefaultSafetyScore() {
            Users u = user(1L);
            Drivers incoming = driver(null, u);
            incoming.setSafetyScore((byte) 50); // caller tries to set custom score — must be ignored

            when(userRepository.findById(1L)).thenReturn(Optional.of(u));
            when(driverRepository.findByLicenseNumber("LIC-null")).thenReturn(null);
            when(driverRepository.save(any())).thenAnswer(inv -> {
                Drivers saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });

            Drivers result = driversService.create(incoming);

            assertThat(result.getSafetyScore()).isEqualTo((byte) 100);
        }

        @Test
        @DisplayName("forces id to null before saving to prevent update")
        void forcesIdToNull() {
            Users u = user(1L);
            Drivers incoming = driver(99L, u); // pre-set id

            when(userRepository.findById(1L)).thenReturn(Optional.of(u));
            when(driverRepository.findByLicenseNumber("LIC-99")).thenReturn(null);
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            driversService.create(incoming);

            verify(driverRepository).save(argThat(d -> d.getId() == null));
        }

        @Test
        @DisplayName("links user back-reference (user.setDriver) after save")
        void linksUserBackReference() {
            Users u = user(1L);
            Drivers incoming = driver(null, u);

            when(userRepository.findById(1L)).thenReturn(Optional.of(u));
            when(driverRepository.findByLicenseNumber("LIC-null")).thenReturn(null);
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            driversService.create(incoming);

            assertThat(u.getDriver()).isNotNull();
        }

        @Test
        @DisplayName("throws 400 when licenseNumber is null")
        void throwsWhenLicenseNumberNull() {
            Users u = user(1L);
            Drivers incoming = driver(null, u);
            incoming.setLicenseNumber(null);

            assertThatThrownBy(() -> driversService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("LicenseNumber is required");
        }

        @Test
        @DisplayName("throws 400 when licenseNumber is blank")
        void throwsWhenLicenseNumberBlank() {
            Users u = user(1L);
            Drivers incoming = driver(null, u);
            incoming.setLicenseNumber("   ");

            assertThatThrownBy(() -> driversService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("LicenseNumber is required");
        }

        @Test
        @DisplayName("throws 400 when licenseNumber already exists")
        void throwsWhenLicenseDuplicate() {
            Users u = user(1L);
            Drivers incoming = driver(null, u);
            when(driverRepository.findByLicenseNumber("LIC-null")).thenReturn(new Drivers());

            assertThatThrownBy(() -> driversService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("LicenseNumber already exists");
        }

        @Test
        @DisplayName("throws 400 when hireDate is null")
        void throwsWhenHireDateNull() {
            Users u = user(1L);
            Drivers incoming = driver(null, u);
            incoming.setHireDate(null);
            when(driverRepository.findByLicenseNumber(any())).thenReturn(null);

            assertThatThrownBy(() -> driversService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("HireDate is required");
        }

        @Test
        @DisplayName("throws 400 when status is null")
        void throwsWhenStatusNull() {
            Users u = user(1L);
            Drivers incoming = driver(null, u);
            incoming.setStatus(null);
            when(driverRepository.findByLicenseNumber(any())).thenReturn(null);

            assertThatThrownBy(() -> driversService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver status is required");
        }

        @Test
        @DisplayName("throws 400 when user is null")
        void throwsWhenUserNull() {
            Drivers incoming = driver(null, null);
            incoming.setUser(null);
            when(driverRepository.findByLicenseNumber(any())).thenReturn(null);

            assertThatThrownBy(() -> driversService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User id is required");
        }

        @Test
        @DisplayName("throws 400 when user.id is null")
        void throwsWhenUserIdNull() {
            Users u = user(null); // id is null
            Drivers incoming = driver(null, u);
            when(driverRepository.findByLicenseNumber(any())).thenReturn(null);

            assertThatThrownBy(() -> driversService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User id is required");
        }

        @Test
        @DisplayName("throws 400 when user not found in repository")
        void throwsWhenUserNotFound() {
            Users u = user(1L);
            Drivers incoming = driver(null, u);
            when(driverRepository.findByLicenseNumber(any())).thenReturn(null);
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> driversService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("throws 400 when user is already assigned to another driver")
        void throwsWhenUserAlreadyAssigned() {
            Users u = user(1L);
            u.setDriver(new Drivers()); // already has a driver
            Drivers incoming = driver(null, u);
            when(driverRepository.findByLicenseNumber(any())).thenReturn(null);
            when(userRepository.findById(1L)).thenReturn(Optional.of(u));

            assertThatThrownBy(() -> driversService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User already assigned to a driver");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  update
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("update()")
    class Update {

        @Test
        @DisplayName("updates licenseNumber when changed and not duplicate")
        void updatesLicenseNumber() {
            Users u = user(1L);
            Drivers existing = driver(1L, u);
            Drivers payload = new Drivers();
            payload.setLicenseNumber("LIC-NEW");

            when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(driverRepository.findByLicenseNumber("LIC-NEW")).thenReturn(null);
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Drivers result = driversService.update(1L, payload);

            assertThat(result.getLicenseNumber()).isEqualTo("LIC-NEW");
        }

        @Test
        @DisplayName("allows update with same licenseNumber (no conflict)")
        void allowsSameLicenseNumber() {
            Users u = user(1L);
            Drivers existing = driver(1L, u);
            Drivers payload = new Drivers();
            payload.setLicenseNumber("LIC-1"); // same as existing

            when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            assertThatCode(() -> driversService.update(1L, payload)).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("throws 400 when new licenseNumber is already used by another driver")
        void throwsWhenLicenseTaken() {
            Users u = user(1L);
            Drivers existing = driver(1L, u);
            Drivers other = driver(2L, u);

            Drivers payload = new Drivers();
            payload.setLicenseNumber("LIC-2");

            when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(driverRepository.findByLicenseNumber("LIC-2")).thenReturn(other);

            assertThatThrownBy(() -> driversService.update(1L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("LicenseNumber already in use");
        }

        @Test
        @DisplayName("updates hireDate when provided")
        void updatesHireDate() {
            Users u = user(1L);
            Drivers existing = driver(1L, u);
            Date newDate = new Date(System.currentTimeMillis() - 86_400_000); // yesterday
            Drivers payload = new Drivers();
            payload.setHireDate(newDate);

            when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Drivers result = driversService.update(1L, payload);

            assertThat(result.getHireDate()).isEqualTo(newDate);
        }

        @Test
        @DisplayName("updates safetyScore when provided")
        void updatesSafetyScore() {
            Users u = user(1L);
            Drivers existing = driver(1L, u);
            Drivers payload = new Drivers();
            payload.setSafetyScore((byte) 75);

            when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Drivers result = driversService.update(1L, payload);

            assertThat(result.getSafetyScore()).isEqualTo((byte) 75);
        }

        @Test
        @DisplayName("updates status when provided")
        void updatesStatus() {
            Users u = user(1L);
            Drivers existing = driver(1L, u);
            Drivers payload = new Drivers();
            payload.setStatus(DriverStatus.SUSPENDED);

            when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Drivers result = driversService.update(1L, payload);

            assertThat(result.getStatus()).isEqualTo(DriverStatus.SUSPENDED);
        }

        @Test
        @DisplayName("reassigns driver to a new user when user.id changes")
        void reassignsUserSuccessfully() {
            Users oldUser = user(1L);
            Users newUser = user(2L);
            Drivers existing = driver(1L, oldUser);
            oldUser.setDriver(existing);

            Drivers payload = new Drivers();
            Users payloadUser = new Users();
            payloadUser.setId(2L);
            payload.setUser(payloadUser);

            when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(userRepository.findById(2L)).thenReturn(Optional.of(newUser));
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Drivers result = driversService.update(1L, payload);

            assertThat(result.getUser().getId()).isEqualTo(2L);
            // old user's back-reference must be cleared
            assertThat(oldUser.getDriver()).isNull();
            // new user's back-reference must be set
            assertThat(newUser.getDriver()).isEqualTo(result);
        }

        @Test
        @DisplayName("throws 400 when new user is already assigned to a different driver")
        void throwsWhenNewUserAlreadyTaken() {
            Users u1 = user(1L);
            Users u2 = user(2L);
            Drivers existing = driver(1L, u1);
            Drivers anotherDriver = driver(2L, u2);
            u2.setDriver(anotherDriver); // u2 already belongs to driver #2

            Drivers payload = new Drivers();
            Users payloadUser = new Users();
            payloadUser.setId(2L);
            payload.setUser(payloadUser);

            when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(userRepository.findById(2L)).thenReturn(Optional.of(u2));

            assertThatThrownBy(() -> driversService.update(1L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User already assigned to a different driver");
        }

        @Test
        @DisplayName("throws 404 when driver to update not found")
        void throwsWhenDriverNotFound() {
            when(driverRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> driversService.update(99L, new Drivers()))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver not found");
        }

        @Test
        @DisplayName("skips null fields — partial update leaves unchanged fields intact")
        void partialUpdatePreservesNullFields() {
            Users u = user(1L);
            Drivers existing = driver(1L, u);
            existing.setStatus(DriverStatus.ACTIVE);
            existing.setSafetyScore((byte) 80);

            // payload has all nulls
            Drivers payload = new Drivers();

            when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(driverRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Drivers result = driversService.update(1L, payload);

            assertThat(result.getStatus()).isEqualTo(DriverStatus.ACTIVE);
            assertThat(result.getSafetyScore()).isEqualTo((byte) 80);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  delete
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("deletes driver and clears user back-reference")
        void deletesDriverAndClearsUserReference() {
            Users u = user(1L);
            Drivers d = driver(1L, u);
            u.setDriver(d);

            when(driverRepository.findById(1L)).thenReturn(Optional.of(d));

            driversService.delete(1L);

            verify(driverRepository).deleteById(1L);
            assertThat(u.getDriver()).isNull();
        }

        @Test
        @DisplayName("deletes driver even when user is null (orphan driver)")
        void deletesDriverWithNoUser() {
            Drivers d = driver(1L, null);
            d.setUser(null);

            when(driverRepository.findById(1L)).thenReturn(Optional.of(d));

            assertThatCode(() -> driversService.delete(1L)).doesNotThrowAnyException();
            verify(driverRepository).deleteById(1L);
        }

        @Test
        @DisplayName("throws 404 when driver not found")
        void throwsWhenDriverNotFound() {
            when(driverRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> driversService.delete(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver not found");
        }
    }
}
