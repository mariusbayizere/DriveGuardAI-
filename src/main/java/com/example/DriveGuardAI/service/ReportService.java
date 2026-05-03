package com.example.DriveGuardAI.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DriveGuardAI.Enum.Severity;
import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.repository.IncidentRepository;

/**
 * Service for generating incident reports
 * Supports: Today, Weekly (last 7 days), Monthly (last 30 days)
 * 
 * Save as: ~/DriveGuardAI-/src/main/java/com/example/DriveGuardAI/service/ReportService.java
 */
@Service
@Transactional(readOnly = true)
public class ReportService {
    
    private final IncidentRepository incidentRepository;
    
    public ReportService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }
    
    // ========================================
    // TODAY'S REPORT
    // ========================================
    /**
     * Get incident report for today
     * @return Map containing incidents and statistics
     */
    public Map<String, Object> getTodayReport() {
        List<Incidents> incidents = getIncidentsForToday();
        return buildReportMap(incidents, "TODAY", getTodayLabel());
    }
    
    // ========================================
    // WEEKLY REPORT (Last 7 days)
    // ========================================
    /**
     * Get incident report for the last 7 days
     * @return Map containing incidents and statistics
     */
    public Map<String, Object> getWeeklyReport() {
        List<Incidents> incidents = getIncidentsForWeek();
        return buildReportMap(incidents, "WEEKLY", getWeeklyLabel());
    }
    
    // ========================================
    // MONTHLY REPORT (Last 30 days)
    // ========================================
    /**
     * Get incident report for the last 30 days
     * @return Map containing incidents and statistics
     */
    public Map<String, Object> getMonthlyReport() {
        List<Incidents> incidents = getIncidentsForMonth();
        return buildReportMap(incidents, "MONTHLY", getMonthlyLabel());
    }
    
    // ========================================
    // HELPER METHODS - DATE FILTERING
    // ========================================
    
    /**
     * Get all incidents from today
     */
    private List<Incidents> getIncidentsForToday() {
        LocalDate today = LocalDate.now();
        return getAllIncidents().stream()
                .filter(incident -> isDateEqual(incident.getTimestamp(), today))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }
    
    /**
     * Get all incidents from last 7 days
     */
    private List<Incidents> getIncidentsForWeek() {
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        return getAllIncidents().stream()
                .filter(incident -> isDateAfterOrEqual(incident.getTimestamp(), weekAgo))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }
    
    /**
     * Get all incidents from last 30 days
     */
    private List<Incidents> getIncidentsForMonth() {
        LocalDate monthAgo = LocalDate.now().minusDays(30);
        return getAllIncidents().stream()
                .filter(incident -> isDateAfterOrEqual(incident.getTimestamp(), monthAgo))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }
    
    /**
     * Get all incidents from database
     */
    private List<Incidents> getAllIncidents() {
        return incidentRepository.findAll();
    }
    
    /**
     * Check if incident timestamp matches a specific date
     */
    private boolean isDateEqual(String timestamp, LocalDate date) {
        try {
            LocalDateTime dateTime = parseTimestamp(timestamp);
            return dateTime.toLocalDate().equals(date);
        } catch (Exception e) {
            System.err.println("❌ Error parsing timestamp: " + timestamp + " | " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Check if incident timestamp is on or after a given date
     */
    private boolean isDateAfterOrEqual(String timestamp, LocalDate date) {
        try {
            LocalDateTime dateTime = parseTimestamp(timestamp);
            return !dateTime.toLocalDate().isBefore(date);
        } catch (Exception e) {
            System.err.println("❌ Error parsing timestamp: " + timestamp + " | " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Parse ISO 8601 timestamp format: 2026-02-17T12:22:02.249655
     */
    private LocalDateTime parseTimestamp(String timestamp) {
        try {
            // Handle ISO 8601 with milliseconds/nanoseconds
            return LocalDateTime.parse(timestamp, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            throw new RuntimeException("Unable to parse timestamp: " + timestamp, e);
        }
    }
    
    // ========================================
    // HELPER METHODS - REPORT BUILDING
    // ========================================
    
    /**
     * Build report map with incidents and statistics
     */
    private Map<String, Object> buildReportMap(
            List<Incidents> incidents, 
            String period, 
            String periodLabel) {
        
        Map<String, Object> report = new HashMap<>();
        report.put("period", period);
        report.put("periodLabel", periodLabel);
        report.put("incidents", incidents);
        
        // Calculate statistics
        report.put("totalIncidents", incidents.size());
        report.put("criticalCount", countBySeverity(incidents, Severity.CRITICAL));
        report.put("highCount", countBySeverity(incidents, Severity.HIGH));
        report.put("mediumCount", countBySeverity(incidents, Severity.MEDIUM));
        report.put("lowCount", countBySeverity(incidents, Severity.LOW));
        
        // Count affected drivers
        long affectedDrivers = incidents.stream()
                .map(incident -> incident.getDriver().getId())
                .distinct()
                .count();
        report.put("affectedDrivers", (int) affectedDrivers);
        
        System.out.println("📊 Report generated: " + period + " | Total Incidents: " + incidents.size());
        
        return report;
    }
    
    /**
     * Count incidents by severity level
     */
    private int countBySeverity(List<Incidents> incidents, Severity severity) {
        return (int) incidents.stream()
                .filter(i -> i.getSeverity() == severity)
                .count();
    }
    
    // ========================================
    // HELPER METHODS - LABEL FORMATTING
    // ========================================
    
    /**
     * Generate label for today's date
     * Example: "22 February 2026"
     */
    private String getTodayLabel() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        return LocalDate.now().format(formatter);
    }
    
    /**
     * Generate label for this week
     * Example: "Week of 15-21 February 2026"
     */
    private String getWeeklyLabel() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate weekEnd = weekStart.plusDays(6);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM");
        return String.format("Week of %s - %s %d", 
            weekStart.format(formatter), 
            weekEnd.format(formatter),
            weekEnd.getYear());
    }
    
    /**
     * Generate label for last 30 days
     * Example: "Last 30 Days (18 Jan - 17 Feb 2026)"
     */
    private String getMonthlyLabel() {
        LocalDate today = LocalDate.now();
        LocalDate monthAgo = today.minusDays(30);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM");
        return String.format("Last 30 Days (%s - %s %d)", 
            monthAgo.format(formatter),
            today.format(formatter),
            today.getYear());
    }
}
