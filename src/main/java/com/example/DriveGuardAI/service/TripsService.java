/*

package com.example.DriveGuardAI.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.TripRepository;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.VehiclesRepository;

@Service
@Transactional
public class TripsService {

    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;
    private final VehiclesRepository vehiclesRepository;

    public TripsService(TripRepository tripRepository,
                        DriverRepository driverRepository,
                        VehiclesRepository vehiclesRepository) {
        this.tripRepository = tripRepository;
        this.driverRepository = driverRepository;
        this.vehiclesRepository = vehiclesRepository;
    }

    public List<Trips> findAll() {
        return tripRepository.findAll();
    }

    public Trips findById(Long id) {
        return tripRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
    }

    public Trips create(Trips trip) {
        if (trip.getStartTime() == null || trip.getStartTime().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime is required");
        }
        if (trip.getEndTime() == null || trip.getEndTime().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime is required");
        }
        if (trip.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }
        if (trip.getDriver() == null || trip.getDriver().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driver id is required");
        }
        if (trip.getVehicle() == null || trip.getVehicle().getVehicleId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vehicle id is required");
        }

        Drivers driver = driverRepository.findById(trip.getDriver().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));
        Vehicles vehicle = vehiclesRepository.findById(trip.getVehicle().getVehicleId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found"));

        trip.setTripId(null);
        trip.setDriver(driver);
        trip.setVehicle(vehicle);

        return tripRepository.save(trip);
    }

    public Trips update(Long id, Trips payload) {
        Trips existing = tripRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        if (payload.getStartTime() != null) existing.setStartTime(payload.getStartTime());
        if (payload.getEndTime() != null) existing.setEndTime(payload.getEndTime());
        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());

        if (payload.getDriver() != null && payload.getDriver().getId() != null) {
            Drivers driver = driverRepository.findById(payload.getDriver().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));
            existing.setDriver(driver);
        }

        if (payload.getVehicle() != null && payload.getVehicle().getVehicleId() != null) {
            Vehicles vehicle = vehiclesRepository.findById(payload.getVehicle().getVehicleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found"));
            existing.setVehicle(vehicle);
        }

        return tripRepository.save(existing);
    }

    public void delete(Long id) {
        if (!tripRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found");
        }
        tripRepository.deleteById(id);
    }
}

*/




//-----------------------------------------------


/*

package com.example.DriveGuardAI.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.TripRepository;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.VehiclesRepository;

@Service
@Transactional
public class TripsService {

    private final TripRepository     tripRepository;
    private final DriverRepository   driverRepository;
    private final VehiclesRepository vehiclesRepository;

    public TripsService(TripRepository tripRepository,
                        DriverRepository driverRepository,
                        VehiclesRepository vehiclesRepository) {
        this.tripRepository     = tripRepository;
        this.driverRepository   = driverRepository;
        this.vehiclesRepository = vehiclesRepository;
    }

    public List<Trips> findAll() {
        return tripRepository.findAll();
    }

    public Trips findById(Long id) {
        return tripRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
    }

    // ✅ NEW: Get all trips for a specific driver.
    // Called by GET /api/v1/trips/driver/{driverId}.
    // Uses the driver's own PK (not the user ID).
    // The React frontend first resolves the driver ID via /api/v1/drivers/user/{userId},
    // then calls this endpoint.
    public List<Trips> findByDriverId(Long driverId) {
        Drivers driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Driver not found with id: " + driverId));
        return driver.getTrips();
    }

    public Trips create(Trips trip) {
        if (trip.getTripName() == null || trip.getTripName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripName is required");
        }
        if (trip.getStartTime() == null || trip.getStartTime().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime is required");
        }
        if (trip.getEndTime() == null || trip.getEndTime().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime is required");
        }
        if (trip.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }
        if (trip.getDriver() == null || trip.getDriver().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driver id is required");
        }
        if (trip.getVehicle() == null || trip.getVehicle().getVehicleId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vehicle id is required");
        }

        Drivers driver = driverRepository.findById(trip.getDriver().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));
        Vehicles vehicle = vehiclesRepository.findById(trip.getVehicle().getVehicleId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found"));

        trip.setTripId(null);
        trip.setDriver(driver);
        trip.setVehicle(vehicle);

        return tripRepository.save(trip);
    }

    public Trips update(Long id, Trips payload) {
        Trips existing = tripRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        if (payload.getTripName()  != null) existing.setTripName(payload.getTripName());
        if (payload.getStartTime() != null) existing.setStartTime(payload.getStartTime());
        if (payload.getEndTime()   != null) existing.setEndTime(payload.getEndTime());
        if (payload.getStatus()    != null) existing.setStatus(payload.getStatus());

        if (payload.getDriver() != null && payload.getDriver().getId() != null) {
            Drivers driver = driverRepository.findById(payload.getDriver().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));
            existing.setDriver(driver);
        }

        if (payload.getVehicle() != null && payload.getVehicle().getVehicleId() != null) {
            Vehicles vehicle = vehiclesRepository.findById(payload.getVehicle().getVehicleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found"));
            existing.setVehicle(vehicle);
        }

        return tripRepository.save(existing);
    }

    public void delete(Long id) {
        if (!tripRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found");
        }
        tripRepository.deleteById(id);
    }
}

*/




package com.example.DriveGuardAI.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.TripRepository;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.VehiclesRepository;

@Service
@Transactional
public class TripsService {

    private final TripRepository     tripRepository;
    private final DriverRepository   driverRepository;
    private final VehiclesRepository vehiclesRepository;

    public TripsService(TripRepository tripRepository,
                        DriverRepository driverRepository,
                        VehiclesRepository vehiclesRepository) {
        this.tripRepository     = tripRepository;
        this.driverRepository   = driverRepository;
        this.vehiclesRepository = vehiclesRepository;
    }

    public List<Trips> findAll() {
        return tripRepository.findAll();
    }

    public Trips findById(Long id) {
        return tripRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
    }

    // ✅ FIXED: Use a direct JPQL query instead of lazy-loading driver.getTrips().
    // The original implementation called driver.getTrips() which uses a lazy-loaded
    // collection — once the Hibernate session closes, this returns an empty list.
    // Using a repository query avoids the session/lazy-loading problem entirely.
    public List<Trips> findByDriverId(Long driverId) {
        // Verify the driver exists first — gives a clean 404 if not found
        if (!driverRepository.existsById(driverId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Driver not found with id: " + driverId);
        }
        // Use direct query — add this method to TripRepository (see below)
        return tripRepository.findByDriverId(driverId);
    }

    public Trips create(Trips trip) {
        if (trip.getTripName() == null || trip.getTripName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripName is required");
        }
        if (trip.getStartTime() == null || trip.getStartTime().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime is required");
        }
        if (trip.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }
        if (trip.getDriver() == null || trip.getDriver().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driver id is required");
        }
        if (trip.getVehicle() == null || trip.getVehicle().getVehicleId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vehicle id is required");
        }

        Drivers driver = driverRepository.findById(trip.getDriver().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));
        Vehicles vehicle = vehiclesRepository.findById(trip.getVehicle().getVehicleId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found"));

        trip.setTripId(null);
        trip.setDriver(driver);
        trip.setVehicle(vehicle);

        return tripRepository.save(trip);
    }

    public Trips update(Long id, Trips payload) {
        Trips existing = tripRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        if (payload.getTripName()  != null) existing.setTripName(payload.getTripName());
        if (payload.getStartTime() != null) existing.setStartTime(payload.getStartTime());
        if (payload.getEndTime()   != null) existing.setEndTime(payload.getEndTime());
        if (payload.getStatus()    != null) existing.setStatus(payload.getStatus());

        if (payload.getDriver() != null && payload.getDriver().getId() != null) {
            Drivers driver = driverRepository.findById(payload.getDriver().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));
            existing.setDriver(driver);
        }

        if (payload.getVehicle() != null && payload.getVehicle().getVehicleId() != null) {
            Vehicles vehicle = vehiclesRepository.findById(payload.getVehicle().getVehicleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found"));
            existing.setVehicle(vehicle);
        }

        return tripRepository.save(existing);
    }

    public void delete(Long id) {
        if (!tripRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found");
        }
        tripRepository.deleteById(id);
    }
}
