package com.example.DriveGuardAI.service;

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
@DisplayName("TripsService Unit Tests")
class TripsServiceTest {

    @Mock private TripRepository     tripRepository;
    @Mock private DriverRepository   driverRepository;
    @Mock private VehiclesRepository vehiclesRepository;

    @InjectMocks
    private TripsService tripsService;

    // ─── Seed helpers ─────────────────────────────────────────────────────────

    private Drivers driver(Long id) {
        Users u = new Users();
        u.setId(id);
        u.setFirstName("John");
        u.setLastName("Doe");
        u.setEmail("john@test.com");
        u.setPassword("encoded");
        u.setUserRole(UserRole.DRIVER);

        Drivers d = new Drivers();
        d.setId(id);
        d.setLicenseNumber("LIC-" + id);
        d.setHireDate(new Date());
        d.setSafetyScore((byte) 100);
        d.setStatus(DriverStatus.ACTIVE);
        d.setUser(u);
        return d;
    }

    private Vehicles vehicle(Long id) {
        Vehicles v = new Vehicles();
        v.setVehicleId(id);
        v.setPlateNumber("PLT-" + id);
        v.setLicensePlate("LIC-PLT-" + id);
        v.setModel("Toyota Hilux");
        v.setStatus(VehiclesStatus.ACTIVE);
        return v;
    }

    private Trips trip(Long id, Drivers d, Vehicles v) {
        Trips t = new Trips();
        t.setTripId(id);
        t.setTripName("Trip-" + id);
        t.setStartTime("2026-05-03T08:00:00");
        t.setEndTime("2026-05-03T10:00:00");
        t.setStatus(Trips_Status.COMPLETED);
        t.setDriver(d);
        t.setVehicle(v);
        return t;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  findAll
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("findAll()")
    class FindAll {

        @Test
        @DisplayName("returns all trips from repository")
        void returnsAllTrips() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            when(tripRepository.findAll()).thenReturn(List.of(trip(1L, d, v), trip(2L, d, v)));

            assertThat(tripsService.findAll()).hasSize(2);
            verify(tripRepository).findAll();
        }

        @Test
        @DisplayName("returns empty list when no trips exist")
        void returnsEmptyList() {
            when(tripRepository.findAll()).thenReturn(List.of());

            assertThat(tripsService.findAll()).isEmpty();
            verify(tripRepository).findAll();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  findById
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("findById()")
    class FindById {

        @Test
        @DisplayName("returns trip when found")
        void returnsTripWhenFound() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips t = trip(1L, d, v);
            when(tripRepository.findById(1L)).thenReturn(Optional.of(t));

            Trips result = tripsService.findById(1L);

            assertThat(result.getTripId()).isEqualTo(1L);
            assertThat(result.getTripName()).isEqualTo("Trip-1");
        }

        @Test
        @DisplayName("throws 404 when trip not found")
        void throwsWhenNotFound() {
            when(tripRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tripsService.findById(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Trip not found");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  findByDriverId
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("findByDriverId()")
    class FindByDriverId {

        @Test
        @DisplayName("returns trips for existing driver")
        void returnsTripsByDriverId() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            when(driverRepository.existsById(1L)).thenReturn(true);
            when(tripRepository.findByDriverId(1L)).thenReturn(List.of(trip(1L, d, v), trip(2L, d, v)));

            assertThat(tripsService.findByDriverId(1L)).hasSize(2);
            verify(tripRepository).findByDriverId(1L);
        }

        @Test
        @DisplayName("returns empty list when driver has no trips")
        void returnsEmptyListForDriverWithNoTrips() {
            when(driverRepository.existsById(1L)).thenReturn(true);
            when(tripRepository.findByDriverId(1L)).thenReturn(List.of());

            assertThat(tripsService.findByDriverId(1L)).isEmpty();
        }

        @Test
        @DisplayName("throws 404 when driver does not exist")
        void throwsWhenDriverNotFound() {
            when(driverRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> tripsService.findByDriverId(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver not found with id: 99");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  create
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("create()")
    class Create {

        private Trips validIncoming() {
            Drivers dRef = new Drivers();
            dRef.setId(1L);
            Vehicles vRef = new Vehicles();
            vRef.setVehicleId(1L);

            Trips t = new Trips();
            t.setTripName("Morning Route");
            t.setStartTime("2026-05-03T08:00:00");
            t.setEndTime("2026-05-03T10:00:00");
            t.setStatus(Trips_Status.ONGOING);
            t.setDriver(dRef);
            t.setVehicle(vRef);
            return t;
        }

        @Test
        @DisplayName("saves trip and returns it with resolved driver and vehicle")
        void savesTripSuccessfully() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips incoming = validIncoming();

            when(driverRepository.findById(1L)).thenReturn(Optional.of(d));
            when(vehiclesRepository.findById(1L)).thenReturn(Optional.of(v));
            when(tripRepository.save(any())).thenAnswer(inv -> {
                Trips saved = inv.getArgument(0);
                saved.setTripId(1L);
                return saved;
            });

            Trips result = tripsService.create(incoming);

            assertThat(result.getTripId()).isEqualTo(1L);
            assertThat(result.getTripName()).isEqualTo("Morning Route");
            assertThat(result.getDriver().getId()).isEqualTo(1L);
            assertThat(result.getVehicle().getVehicleId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("forces tripId to null before saving to prevent update")
        void forcesTripIdToNull() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips incoming = validIncoming();
            incoming.setTripId(99L); // caller tries to preset ID

            when(driverRepository.findById(1L)).thenReturn(Optional.of(d));
            when(vehiclesRepository.findById(1L)).thenReturn(Optional.of(v));
            when(tripRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            tripsService.create(incoming);

            verify(tripRepository).save(argThat(t -> t.getTripId() == null));
        }

        @Test
        @DisplayName("throws 400 when tripName is null")
        void throwsWhenTripNameNull() {
            Trips incoming = validIncoming();
            incoming.setTripName(null);

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("tripName is required");
        }

        @Test
        @DisplayName("throws 400 when tripName is blank")
        void throwsWhenTripNameBlank() {
            Trips incoming = validIncoming();
            incoming.setTripName("   ");

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("tripName is required");
        }

        @Test
        @DisplayName("throws 400 when startTime is null")
        void throwsWhenStartTimeNull() {
            Trips incoming = validIncoming();
            incoming.setStartTime(null);

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("startTime is required");
        }

        @Test
        @DisplayName("throws 400 when startTime is blank")
        void throwsWhenStartTimeBlank() {
            Trips incoming = validIncoming();
            incoming.setStartTime("  ");

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("startTime is required");
        }

        @Test
        @DisplayName("throws 400 when status is null")
        void throwsWhenStatusNull() {
            Trips incoming = validIncoming();
            incoming.setStatus(null);

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("status is required");
        }

        @Test
        @DisplayName("throws 400 when driver is null")
        void throwsWhenDriverNull() {
            Trips incoming = validIncoming();
            incoming.setDriver(null);

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("driver id is required");
        }

        @Test
        @DisplayName("throws 400 when driver.id is null")
        void throwsWhenDriverIdNull() {
            Trips incoming = validIncoming();
            incoming.getDriver().setId(null);

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("driver id is required");
        }

        @Test
        @DisplayName("throws 400 when vehicle is null")
        void throwsWhenVehicleNull() {
            Trips incoming = validIncoming();
            incoming.setVehicle(null);

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("vehicle id is required");
        }

        @Test
        @DisplayName("throws 400 when vehicle.vehicleId is null")
        void throwsWhenVehicleIdNull() {
            Trips incoming = validIncoming();
            incoming.getVehicle().setVehicleId(null);

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("vehicle id is required");
        }

        @Test
        @DisplayName("throws 400 when driver not found in repository")
        void throwsWhenDriverNotFound() {
            Trips incoming = validIncoming();
            when(driverRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver not found");
        }

        @Test
        @DisplayName("throws 400 when vehicle not found in repository")
        void throwsWhenVehicleNotFound() {
            Trips incoming = validIncoming();
            when(driverRepository.findById(1L)).thenReturn(Optional.of(driver(1L)));
            when(vehiclesRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tripsService.create(incoming))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Vehicle not found");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  update
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("update()")
    class Update {

        @Test
        @DisplayName("updates tripName when provided")
        void updatesTripName() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips existing = trip(1L, d, v);
            Trips payload = new Trips();
            payload.setTripName("Evening Route");

            when(tripRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(tripRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Trips result = tripsService.update(1L, payload);

            assertThat(result.getTripName()).isEqualTo("Evening Route");
        }

        @Test
        @DisplayName("updates startTime when provided")
        void updatesStartTime() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips existing = trip(1L, d, v);
            Trips payload = new Trips();
            payload.setStartTime("2026-05-04T06:00:00");

            when(tripRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(tripRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Trips result = tripsService.update(1L, payload);

            assertThat(result.getStartTime()).isEqualTo("2026-05-04T06:00:00");
        }

        @Test
        @DisplayName("updates endTime when provided")
        void updatesEndTime() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips existing = trip(1L, d, v);
            Trips payload = new Trips();
            payload.setEndTime("2026-05-04T14:00:00");

            when(tripRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(tripRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Trips result = tripsService.update(1L, payload);

            assertThat(result.getEndTime()).isEqualTo("2026-05-04T14:00:00");
        }

        @Test
        @DisplayName("updates status when provided")
        void updatesStatus() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips existing = trip(1L, d, v);
            Trips payload = new Trips();
            payload.setStatus(Trips_Status.CANCELLED);

            when(tripRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(tripRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Trips result = tripsService.update(1L, payload);

            assertThat(result.getStatus()).isEqualTo(Trips_Status.CANCELLED);
        }

        @Test
        @DisplayName("reassigns driver when driver.id is provided")
        void reassignsDriver() {
            Drivers oldDriver = driver(1L);
            Drivers newDriver = driver(2L);
            Vehicles v = vehicle(1L);
            Trips existing = trip(1L, oldDriver, v);

            Drivers dRef = new Drivers();
            dRef.setId(2L);
            Trips payload = new Trips();
            payload.setDriver(dRef);

            when(tripRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(driverRepository.findById(2L)).thenReturn(Optional.of(newDriver));
            when(tripRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Trips result = tripsService.update(1L, payload);

            assertThat(result.getDriver().getId()).isEqualTo(2L);
        }

        @Test
        @DisplayName("reassigns vehicle when vehicle.vehicleId is provided")
        void reassignsVehicle() {
            Drivers d = driver(1L);
            Vehicles oldVehicle = vehicle(1L);
            Vehicles newVehicle = vehicle(2L);
            Trips existing = trip(1L, d, oldVehicle);

            Vehicles vRef = new Vehicles();
            vRef.setVehicleId(2L);
            Trips payload = new Trips();
            payload.setVehicle(vRef);

            when(tripRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(vehiclesRepository.findById(2L)).thenReturn(Optional.of(newVehicle));
            when(tripRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Trips result = tripsService.update(1L, payload);

            assertThat(result.getVehicle().getVehicleId()).isEqualTo(2L);
        }

        @Test
        @DisplayName("skips null fields — partial update preserves existing values")
        void partialUpdatePreservesNullFields() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips existing = trip(1L, d, v);
            existing.setStatus(Trips_Status.ONGOING);
            existing.setTripName("Original Name");

            // payload has all nulls
            Trips payload = new Trips();

            when(tripRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(tripRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Trips result = tripsService.update(1L, payload);

            assertThat(result.getStatus()).isEqualTo(Trips_Status.ONGOING);
            assertThat(result.getTripName()).isEqualTo("Original Name");
        }

        @Test
        @DisplayName("throws 404 when trip not found")
        void throwsWhenTripNotFound() {
            when(tripRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tripsService.update(99L, new Trips()))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Trip not found");
        }

        @Test
        @DisplayName("throws 400 when new driver not found in repository")
        void throwsWhenNewDriverNotFound() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips existing = trip(1L, d, v);

            Drivers dRef = new Drivers();
            dRef.setId(99L);
            Trips payload = new Trips();
            payload.setDriver(dRef);

            when(tripRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(driverRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tripsService.update(1L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Driver not found");
        }

        @Test
        @DisplayName("throws 400 when new vehicle not found in repository")
        void throwsWhenNewVehicleNotFound() {
            Drivers d = driver(1L);
            Vehicles v = vehicle(1L);
            Trips existing = trip(1L, d, v);

            Vehicles vRef = new Vehicles();
            vRef.setVehicleId(99L);
            Trips payload = new Trips();
            payload.setVehicle(vRef);

            when(tripRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(vehiclesRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tripsService.update(1L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Vehicle not found");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  delete
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("deletes trip when found")
        void deletesTripWhenFound() {
            when(tripRepository.existsById(1L)).thenReturn(true);

            tripsService.delete(1L);

            verify(tripRepository).deleteById(1L);
        }

        @Test
        @DisplayName("throws 404 when trip not found")
        void throwsWhenTripNotFound() {
            when(tripRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> tripsService.delete(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Trip not found");

            verify(tripRepository, never()).deleteById(any());
        }
    }
}
