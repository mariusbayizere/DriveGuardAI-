package com.example.DriveGuardAI.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.UserRepository;

@Service
@Transactional
public class DriversService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    public DriversService(DriverRepository driverRepository, UserRepository userRepository) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
    }

    public List<Drivers> findAll() {
        return driverRepository.findAll();
    }

    public Drivers findById(Long id) {
        return driverRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));
    }

    public Drivers create(Drivers driver) {
        // basic validation
        if (driver.getLicenseNumber() == null || driver.getLicenseNumber().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LicenseNumber is required");
        }
        if (driver.getHireDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "HireDate is required");
        }
        if (driver.getSafetyScore() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SafetyScore is required");
        }
        if (driver.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver status is required");
        }
        if (driver.getUser() == null || driver.getUser().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
        }

        Users user = userRepository.findById(driver.getUser().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));

        if (user.getDriver() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already assigned to a driver");
        }

        driver.setId(null);
        driver.setUser(user);
        return driverRepository.save(driver);
    }

    public Drivers update(Long id, Drivers payload) {
        Drivers existing = driverRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));

        // update allowed fields
        if (payload.getLicenseNumber() != null) existing.setLicenseNumber(payload.getLicenseNumber());
        if (payload.getHireDate() != null) existing.setHireDate(payload.getHireDate());
        if (payload.getSafetyScore() != null) existing.setSafetyScore(payload.getSafetyScore());
        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());

        if (payload.getUser() != null && payload.getUser().getId() != null) {
            Users user = userRepository.findById(payload.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));

            // if user is assigned to another driver -> reject
            // if (user.getDriver() != null && !user.getDriver().getId().equals(existing.getId())) {
            if (user.getDriver() != null && !user.getDriver().getId().equals(existing.getId())) {

                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already assigned to a different driver");
            }
            existing.setUser(user);
        }

        return driverRepository.save(existing);
    }

    public void delete(Long id) {
        if (!driverRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found");
        }
        driverRepository.deleteById(id);
    }
}