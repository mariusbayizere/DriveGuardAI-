package com.example.DriveGuardAI.service;

import com.example.DriveGuardAI.Enum.DriverStatus;
import com.example.DriveGuardAI.Enum.VehiclesStatus;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.VehiclesRepository;
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
@DisplayName("VehiclesService Unit Tests")
class VehiclesServiceTest {

    @Mock private VehiclesRepository vehiclesRepository;
    @Mock private DriverRepository   driverRepository;

    @InjectMocks
    private VehiclesService vehiclesService;

    private Drivers  validDriver;
    private Vehicles validVehicle;

    @BeforeEach
    void setUp() {
        validDriver = new Drivers();
        validDriver.setId(1L);
        validDriver.setLicenseNumber("LIC-001");
        validDriver.setHireDate(new Date());
        validDriver.setSafetyScore((byte) 90);
        validDriver.setStatus(DriverStatus.ACTIVE);

        validVehicle = new Vehicles();
        validVehicle.setVehicleId(10L);
        validVehicle.setModel("Toyota Hilux");
        validVehicle.setPlateNumber("RAA 001 A");
        validVehicle.setLicensePlate("RAA 001 A");
        validVehicle.setStatus(VehiclesStatus.ACTIVE);
        validVehicle.setDriver(validDriver);
    }

    // ─────────────────────────────────────────────
    //  findAll
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("findAll()")
    class FindAll {

        @Test
        @DisplayName("returns all vehicles from repository")
        void returnsAllVehicles() {
            when(vehiclesRepository.findAll()).thenReturn(List.of(validVehicle));

            List<Vehicles> result = vehiclesService.findAll();

            assertThat(result).hasSize(1).contains(validVehicle);
            verify(vehiclesRepository).findAll();
        }

        @Test
        @DisplayName("returns empty list when no vehicles exist")
        void returnsEmptyList() {
            when(vehiclesRepository.findAll()).thenReturn(List.of());

            List<Vehicles> result = vehiclesService.findAll();

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
        @DisplayName("returns vehicle when found")
        void returnsVehicleWhenFound() {
            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));

            Vehicles result = vehiclesService.findById(10L);

            assertThat(result).isEqualTo(validVehicle);
        }

        @Test
        @DisplayName("throws 404 when vehicle not found")
        void throwsNotFoundWhenMissing() {
            when(vehiclesRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> vehiclesService.findById(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Vehicle not found");
        }
    }

    // ─────────────────────────────────────────────
    //  create
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("create()")
    class Create {

        private Vehicles newVehicle;

        @BeforeEach
        void setup() {
            newVehicle = new Vehicles();
            newVehicle.setModel("Isuzu D-Max");
            newVehicle.setPlateNumber("RAB 002 B");
            newVehicle.setLicensePlate("RAB 002 B");
            newVehicle.setStatus(VehiclesStatus.ACTIVE);
            newVehicle.setDriver(validDriver);
        }

        @Test
        @DisplayName("creates vehicle successfully with valid data")
        void createsVehicleSuccessfully() {
            when(vehiclesRepository.findByLicensePlate("RAB 002 B")).thenReturn(null);
            when(vehiclesRepository.findByPlateNumber("RAB 002 B")).thenReturn(null);
            when(driverRepository.findById(1L)).thenReturn(Optional.of(validDriver));
            when(vehiclesRepository.save(any(Vehicles.class))).thenAnswer(inv -> {
                Vehicles v = inv.getArgument(0);
                v.setVehicleId(20L);
                return v;
            });

            Vehicles result = vehiclesService.create(newVehicle);

            assertThat(result.getVehicleId()).isEqualTo(20L);
            assertThat(result.getPlateNumber()).isEqualTo("RAB 002 B");
            assertThat(result.getDriver()).isEqualTo(validDriver);
            verify(vehiclesRepository).save(any(Vehicles.class));
        }

        @Test
        @DisplayName("forces vehicleId to null before saving — prevents id override")
        void forcesIdToNullBeforeSave() {
            newVehicle.setVehicleId(999L);
            when(vehiclesRepository.findByLicensePlate(any())).thenReturn(null);
            when(vehiclesRepository.findByPlateNumber(any())).thenReturn(null);
            when(driverRepository.findById(1L)).thenReturn(Optional.of(validDriver));
            when(vehiclesRepository.save(any(Vehicles.class))).thenAnswer(inv -> inv.getArgument(0));

            vehiclesService.create(newVehicle);

            verify(vehiclesRepository).save(argThat(v -> v.getVehicleId() == null));
        }

        @Test
        @DisplayName("throws 400 when plateNumber is null")
        void throwsWhenPlateNumberNull() {
            newVehicle.setPlateNumber(null);

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("PlateNumber is required");
        }

        @Test
        @DisplayName("throws 400 when plateNumber is blank")
        void throwsWhenPlateNumberBlank() {
            newVehicle.setPlateNumber("   ");

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("PlateNumber is required");
        }

        @Test
        @DisplayName("throws 400 when licensePlate is null")
        void throwsWhenLicensePlateNull() {
            newVehicle.setLicensePlate(null);

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("LicensePlate is required");
        }

        @Test
        @DisplayName("throws 400 when licensePlate is blank")
        void throwsWhenLicensePlateBlank() {
            newVehicle.setLicensePlate("  ");

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("LicensePlate is required");
        }

        @Test
        @DisplayName("throws 400 when status is null")
        void throwsWhenStatusNull() {
            newVehicle.setStatus(null);

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Vehicle status is required");
        }

        @Test
        @DisplayName("throws 400 when driver is null")
        void throwsWhenDriverNull() {
            newVehicle.setDriver(null);

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver id is required");
        }

        @Test
        @DisplayName("throws 400 when driver id is null")
        void throwsWhenDriverIdNull() {
            Drivers driverWithNoId = new Drivers();
            driverWithNoId.setId(null);
            newVehicle.setDriver(driverWithNoId);

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver id is required");
        }

        @Test
        @DisplayName("throws 400 when licensePlate already exists")
        void throwsWhenLicensePlateAlreadyExists() {
            when(vehiclesRepository.findByLicensePlate("RAB 002 B")).thenReturn(validVehicle);

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("LicensePlate already exists");
        }

        @Test
        @DisplayName("throws 400 when plateNumber already exists")
        void throwsWhenPlateNumberAlreadyExists() {
            when(vehiclesRepository.findByLicensePlate("RAB 002 B")).thenReturn(null);
            when(vehiclesRepository.findByPlateNumber("RAB 002 B")).thenReturn(validVehicle);

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("PlateNumber already exists");
        }

        @Test
        @DisplayName("throws 400 when driver id references non-existent driver")
        void throwsWhenDriverNotFound() {
            when(vehiclesRepository.findByLicensePlate(any())).thenReturn(null);
            when(vehiclesRepository.findByPlateNumber(any())).thenReturn(null);
            when(driverRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> vehiclesService.create(newVehicle))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver not found");
        }
    }

    // ─────────────────────────────────────────────
    //  update
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("update()")
    class Update {

        @Test
        @DisplayName("updates model successfully")
        void updatesModelSuccessfully() {
            Vehicles payload = new Vehicles();
            payload.setModel("Nissan Navara");

            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));
            when(vehiclesRepository.save(any(Vehicles.class))).thenAnswer(inv -> inv.getArgument(0));

            Vehicles result = vehiclesService.update(10L, payload);

            assertThat(result.getModel()).isEqualTo("Nissan Navara");
        }

        @Test
        @DisplayName("updates status successfully")
        void updatesStatusSuccessfully() {
            Vehicles payload = new Vehicles();
            payload.setStatus(VehiclesStatus.MAINTENANCE);

            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));
            when(vehiclesRepository.save(any(Vehicles.class))).thenAnswer(inv -> inv.getArgument(0));

            Vehicles result = vehiclesService.update(10L, payload);

            assertThat(result.getStatus()).isEqualTo(VehiclesStatus.MAINTENANCE);
        }

        @Test
        @DisplayName("updates plateNumber when new plate is unique")
        void updatesPlateNumberWhenUnique() {
            Vehicles payload = new Vehicles();
            payload.setPlateNumber("RAC 003 C");

            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));
            when(vehiclesRepository.findByPlateNumber("RAC 003 C")).thenReturn(null);
            when(vehiclesRepository.save(any(Vehicles.class))).thenAnswer(inv -> inv.getArgument(0));

            Vehicles result = vehiclesService.update(10L, payload);

            assertThat(result.getPlateNumber()).isEqualTo("RAC 003 C");
        }

        @Test
        @DisplayName("updates licensePlate when new plate is unique")
        void updatesLicensePlateWhenUnique() {
            Vehicles payload = new Vehicles();
            payload.setLicensePlate("RAC 003 C");

            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));
            when(vehiclesRepository.findByLicensePlate("RAC 003 C")).thenReturn(null);
            when(vehiclesRepository.save(any(Vehicles.class))).thenAnswer(inv -> inv.getArgument(0));

            Vehicles result = vehiclesService.update(10L, payload);

            assertThat(result.getLicensePlate()).isEqualTo("RAC 003 C");
        }

        @Test
        @DisplayName("throws 400 when new plateNumber is already in use by another vehicle")
        void throwsWhenPlateNumberTaken() {
            Vehicles other = new Vehicles();
            other.setVehicleId(99L);
            other.setPlateNumber("RAD 004 D");

            Vehicles payload = new Vehicles();
            payload.setPlateNumber("RAD 004 D");

            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));
            when(vehiclesRepository.findByPlateNumber("RAD 004 D")).thenReturn(other);

            assertThatThrownBy(() -> vehiclesService.update(10L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("PlateNumber already in use");
        }

        @Test
        @DisplayName("throws 400 when new licensePlate is already in use by another vehicle")
        void throwsWhenLicensePlateTaken() {
            Vehicles other = new Vehicles();
            other.setVehicleId(99L);
            other.setLicensePlate("RAD 004 D");

            Vehicles payload = new Vehicles();
            payload.setLicensePlate("RAD 004 D");

            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));
            when(vehiclesRepository.findByLicensePlate("RAD 004 D")).thenReturn(other);

            assertThatThrownBy(() -> vehiclesService.update(10L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("LicensePlate already in use");
        }

        @Test
        @DisplayName("updates driver when valid driver id is provided")
        void updatesDriverSuccessfully() {
            Drivers newDriver = new Drivers();
            newDriver.setId(2L);

            Vehicles payload = new Vehicles();
            payload.setDriver(newDriver);

            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));
            when(driverRepository.findById(2L)).thenReturn(Optional.of(newDriver));
            when(vehiclesRepository.save(any(Vehicles.class))).thenAnswer(inv -> inv.getArgument(0));

            Vehicles result = vehiclesService.update(10L, payload);

            assertThat(result.getDriver()).isEqualTo(newDriver);
        }

        @Test
        @DisplayName("throws 400 when new driver id references non-existent driver")
        void throwsWhenNewDriverNotFound() {
            Drivers ghostDriver = new Drivers();
            ghostDriver.setId(999L);

            Vehicles payload = new Vehicles();
            payload.setDriver(ghostDriver);

            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));
            when(driverRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> vehiclesService.update(10L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver not found");
        }

        @Test
        @DisplayName("does not overwrite fields that are null in payload")
        void doesNotOverwriteWithNullFields() {
            Vehicles payload = new Vehicles(); // all null

            when(vehiclesRepository.findById(10L)).thenReturn(Optional.of(validVehicle));
            when(vehiclesRepository.save(any(Vehicles.class))).thenAnswer(inv -> inv.getArgument(0));

            Vehicles result = vehiclesService.update(10L, payload);

            assertThat(result.getModel()).isEqualTo("Toyota Hilux");
            assertThat(result.getPlateNumber()).isEqualTo("RAA 001 A");
            assertThat(result.getLicensePlate()).isEqualTo("RAA 001 A");
            assertThat(result.getStatus()).isEqualTo(VehiclesStatus.ACTIVE);
        }

        @Test
        @DisplayName("throws 404 when vehicle to update does not exist")
        void throwsWhenVehicleNotFound() {
            when(vehiclesRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> vehiclesService.update(99L, new Vehicles()))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Vehicle not found");
        }
    }

    // ─────────────────────────────────────────────
    //  delete
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("deletes vehicle when found")
        void deletesVehicleWhenFound() {
            when(vehiclesRepository.existsById(10L)).thenReturn(true);

            vehiclesService.delete(10L);

            verify(vehiclesRepository).deleteById(10L);
        }

        @Test
        @DisplayName("throws 404 and never calls deleteById when vehicle does not exist")
        void throwsWhenVehicleNotFound() {
            when(vehiclesRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> vehiclesService.delete(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Vehicle not found");

            verify(vehiclesRepository, never()).deleteById(any());
        }
    }
}
