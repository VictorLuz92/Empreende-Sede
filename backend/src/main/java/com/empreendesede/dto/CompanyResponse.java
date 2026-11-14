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
        boolean approved,
        boolean hasPendingUpdate,
        PendingData pendingData,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public record PendingData(
            String name,
            String category,
            String logoUrl,
            String description,
            String phone,
            String whatsapp,
            String instagram
    ) {}

    public static CompanyResponse fromEntity(Company company) {
        PendingData pending = company.isHasPendingUpdate()
                ? new PendingData(
                        company.getPendingName(),
                        company.getPendingCategory(),
                        company.getPendingLogoUrl(),
                        company.getPendingDescription(),
                        company.getPendingPhone(),
                        company.getPendingWhatsapp(),
                        company.getPendingInstagram()
                )
                : null;

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
                company.isApproved(),
                company.isHasPendingUpdate(),
                pending,
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }
}
