package com.example.DriveGuardAI.model;
import com.example.DriveGuardAI.enums.Drivers_Status;

import java.util.Date;

public class Drivers {
    private Long id;
    private String licenseNumber;
    private Date hireDate;
    private Byte safetyScore;
    private Drivers_Status status;
}
