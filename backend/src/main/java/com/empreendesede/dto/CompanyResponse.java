package com.empreendesede.dto;

import com.empreendesede.model.Company;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CompanyResponse(
        UUID id,
        String name,
        String category,
        String logoUrl,
        String description,
        String phone,
        String whatsapp,
        String instagram,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static CompanyResponse fromEntity(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getCategory(),
                company.getLogoUrl(),
                company.getDescription(),
                company.getPhone(),
                company.getWhatsapp(),
                company.getInstagram(),
                company.isActive(),
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }
}
