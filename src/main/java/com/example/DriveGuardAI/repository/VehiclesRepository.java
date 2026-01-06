package com.example.DriveGuardAI.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.DriveGuardAI.model.Vehicles;

public interface VehiclesRepository extends JpaRepository<Vehicles, Long> {
    Vehicles findByLicensePlate(String licensePlate);
    Vehicles findByOwnerName(String ownerName);
}
