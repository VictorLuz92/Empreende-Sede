package com.empreendesede.repository;

import com.empreendesede.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

    List<Company> findByActiveTrueAndApprovedTrueOrderByNameAsc();

    @Query("""
            SELECT c FROM Company c
            WHERE c.active = true
              AND c.approved = true
              AND (:category IS NULL OR :category = '' OR LOWER(c.category) = LOWER(:category))
              AND (:query IS NULL OR :query = ''
                   OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(c.category) LIKE LOWER(CONCAT('%', :query, '%')))
            ORDER BY c.name ASC
            """)
    List<Company> searchActiveCompanies(@Param("query") String query, @Param("category") String category);

    @Query("SELECT DISTINCT c.category FROM Company c WHERE c.active = true AND c.approved = true ORDER BY c.category ASC")
    List<String> findDistinctCategories();

    @Query("SELECT c FROM Company c WHERE c.active = true AND (c.approved = false OR c.hasPendingUpdate = true) ORDER BY c.updatedAt DESC")
    List<Company> findPendingApprovals();
}
