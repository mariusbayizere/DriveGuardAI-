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
        if (driver.getLicenseNumber() == null || driver.getLicenseNumber().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LicenseNumber is required");
        }
        Drivers byLicense = driverRepository.findByLicenseNumber(driver.getLicenseNumber());
        if (byLicense != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LicenseNumber already exists");
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

        // keep both sides in sync in-memory so responses show the back-reference
        user.setDriver(driver);

        return driverRepository.save(driver);
    }

    public Drivers update(Long id, Drivers payload) {
        Drivers existing = driverRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));

        if (payload.getLicenseNumber() != null) {
            if (!payload.getLicenseNumber().equals(existing.getLicenseNumber())) {
                Drivers other = driverRepository.findByLicenseNumber(payload.getLicenseNumber());
                if (other != null && !other.getId().equals(existing.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LicenseNumber already in use");
                }
            }
            existing.setLicenseNumber(payload.getLicenseNumber());
        }
        if (payload.getHireDate() != null) existing.setHireDate(payload.getHireDate());
        if (payload.getSafetyScore() != null) existing.setSafetyScore(payload.getSafetyScore());
        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());

        if (payload.getUser() != null && payload.getUser().getId() != null) {
            Users newUser = userRepository.findById(payload.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));

            // reject if newUser already assigned to a different driver
            if (newUser.getDriver() != null && !newUser.getDriver().getId().equals(existing.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already assigned to a different driver");
            }

            // detach previous user's back-reference if switching users
            Users oldUser = existing.getUser();
            if (oldUser != null && !oldUser.getId().equals(newUser.getId())) {
                oldUser.setDriver(null);
            }

            existing.setUser(newUser);
            // keep back-reference in sync
            newUser.setDriver(existing);
        }

        return driverRepository.save(existing);
    }

    public void delete(Long id) {
        Drivers existing = driverRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));

        Users user = existing.getUser();
        if (user != null) {
            user.setDriver(null);
        }

        driverRepository.deleteById(id);
    }
}