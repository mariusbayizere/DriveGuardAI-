
/*
package com.example.DriveGuardAI.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.DriveGuardAI.model.Trips;

public interface TripRepository extends JpaRepository<Trips, Long> {
    
}
*/

package com.example.DriveGuardAI.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.DriveGuardAI.model.Trips;

@Repository
public interface TripRepository extends JpaRepository<Trips, Long> {

    /**
     * FIX: Direct JPQL query to find trips by driverId.
     *
     * The old approach called driver.getTrips() which is a lazy-loaded collection.
     * Once the Hibernate session closes, accessing it returns an empty list silently.
     * This query bypasses lazy loading entirely and fetches directly from the DB.
     */
    @Query("SELECT t FROM Trips t WHERE t.driver.id = :driverId ORDER BY t.startTime DESC")
    List<Trips> findByDriverId(@Param("driverId") Long driverId);
}
