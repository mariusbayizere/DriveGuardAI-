package com.example.DriveGuardAI.service;

import java.util.List;

import com.example.DriveGuardAI.model.Users;

public interface UserService {
    
    public List<Users> getAllUser();

    public Users findUserProfileByJwt(String jwt);

    public Users findUserByEmail(String email);

    public Users findUserById(String userId);

    public List<Users> findAllUsers();
}