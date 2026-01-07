package com.example.DriveGuardAI.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.VehiclesRepository;

@Service
@Transactional
public class VehiclesService {

    private final VehiclesRepository vehiclesRepository;
    private final DriverRepository driverRepository;

    public VehiclesService(VehiclesRepository vehiclesRepository, DriverRepository driverRepository) {
        this.vehiclesRepository = vehiclesRepository;
        this.driverRepository = driverRepository;
    }

    public List<Vehicles> findAll() {
        return vehiclesRepository.findAll();
    }

    public Vehicles findById(Long id) {
        return vehiclesRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    public Vehicles create(Vehicles vehicle) {
        if (vehicle.getPlateNumber() == null || vehicle.getPlateNumber().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PlateNumber is required");
        }
        if (vehicle.getLicensePlate() == null || vehicle.getLicensePlate().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LicensePlate is required");
        }
        if (vehicle.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle status is required");
        }
        if (vehicle.getDriver() == null || vehicle.getDriver().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver id is required");
        }

        // uniqueness checks
        Vehicles byLicense = vehiclesRepository.findByLicensePlate(vehicle.getLicensePlate());
        if (byLicense != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LicensePlate already exists");
        }
        Vehicles byPlate = vehiclesRepository.findByPlateNumber(vehicle.getPlateNumber());
        if (byPlate != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PlateNumber already exists");
        }

        Drivers driver = driverRepository.findById(vehicle.getDriver().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));

        vehicle.setVehicleId(null);
        vehicle.setDriver(driver);
        return vehiclesRepository.save(vehicle);
    }

    public Vehicles update(Long id, Vehicles payload) {
        Vehicles existing = vehiclesRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        if (payload.getModel() != null) existing.setModel(payload.getModel());

        if (payload.getPlateNumber() != null && !payload.getPlateNumber().isBlank()) {
            Vehicles other = vehiclesRepository.findByPlateNumber(payload.getPlateNumber());
            if (other != null && !other.getVehicleId().equals(existing.getVehicleId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PlateNumber already in use");
            }
            existing.setPlateNumber(payload.getPlateNumber());
        }

        if (payload.getLicensePlate() != null && !payload.getLicensePlate().isBlank()) {
            Vehicles other = vehiclesRepository.findByLicensePlate(payload.getLicensePlate());
            if (other != null && !other.getVehicleId().equals(existing.getVehicleId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LicensePlate already in use");
            }
            existing.setLicensePlate(payload.getLicensePlate());
        }

        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());

        if (payload.getDriver() != null && payload.getDriver().getId() != null) {
            Drivers driver = driverRepository.findById(payload.getDriver().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));
            existing.setDriver(driver);
        }

        return vehiclesRepository.save(existing);
    }

    public void delete(Long id) {
        if (!vehiclesRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found");
        }
        vehiclesRepository.deleteById(id);
    }
}