package com.example.DriveGuardAI.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.DriveGuardAI.model.Incidents;

public interface IncidentRepository extends JpaRepository<Incidents , Long> {
   List<Incidents> findByVehicleId(Long vehicleId);
}