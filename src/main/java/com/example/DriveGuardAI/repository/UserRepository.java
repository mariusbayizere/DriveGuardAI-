package com.example.DriveGuardAI.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.DriveGuardAI.model.Users;

public interface UserRepository  extends JpaRepository<Users, Long> {
    Users findByEmail(String email);
    Users findByName(String name);
    
}
