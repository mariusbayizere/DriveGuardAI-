package com.example.DriveGuardAI.model;
import com.example.DriveGuardAI.Enum.DriverStatus;

import java.util.Date;

public class Drivers {
    private Long id;
    private String licenseNumber;
    private Date hireDate;
    private Byte safetyScore;
    private DriverStatus status;
}
