package com.example.DriveGuardAI.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.DriveGuardAI.model.Drivers;

public interface DriverRepository extends JpaRepository<Drivers, Long> {

}
