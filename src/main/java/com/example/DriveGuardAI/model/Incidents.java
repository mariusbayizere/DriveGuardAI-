package com.example.DriveGuardAI.model;

import com.example.DriveGuardAI.enums.IncidentTypes;

public class Incidents {
    private Long incident_id;
    private IncidentTypes incident_type;
    private String description;
    private Severity  severity;
    private String timestamp;
}
