package com.example.DriveGuardAI.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.DriveGuardAI.model.Users;

public interface UserRepository  extends JpaRepository<Users, Long> {
    // Users findByEmail(String email);
    Users findByFirstName(String firstName);
    Optional<Users> findByEmail(String email);
    boolean existsByEmail(String email); 

}
