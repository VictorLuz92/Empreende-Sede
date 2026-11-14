package com.empreendesede.dto;

import com.empreendesede.model.Company;

import java.time.Duration;
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
        UUID ownerId,
        String ownerEmail,
        boolean active,
        boolean approved,
        String paymentStatus,
        String pixTxId,
        String pixPayerNote,
        boolean pendingRenewal,
        OffsetDateTime subscriptionExpiresAt,
        Long daysRemaining,
        boolean expired,
        String pixCode,
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
        return fromEntity(company, null);
    }

    public static CompanyResponse fromEntity(Company company, String pixCode) {
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

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime expires = company.getSubscriptionExpiresAt();
        Long daysRemaining = null;
        boolean expired = false;
        if (expires != null) {
            long hours = Duration.between(now, expires).toHours();
            if (hours <= 0) {
                daysRemaining = 0L;
                expired = true;
            } else {
                daysRemaining = (long) Math.ceil(hours / 24.0);
            }
        }

        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getCategory(),
                company.getLogoUrl(),
                company.getDescription(),
                company.getPhone(),
                company.getWhatsapp(),
                company.getInstagram(),
                company.getOwnerId(),
                company.getOwnerEmail(),
                company.isActive(),
                company.isApproved(),
                company.getPaymentStatus(),
                company.getPixTxId(),
                company.getPixPayerNote(),
                company.isPendingRenewal(),
                expires,
                daysRemaining,
                expired,
                pixCode,
                company.isHasPendingUpdate(),
                pending,
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }
}
