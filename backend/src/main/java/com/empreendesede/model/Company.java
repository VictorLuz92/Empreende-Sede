package com.empreendesede.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 80)
    private String category = "Geral";

    @Column(length = 80)
    private String subsegment;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 30)
    private String whatsapp;

    @Column(length = 120)
    private String instagram;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "owner_email", length = 180)
    private String ownerEmail;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean approved = true;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus = "PAID";

    @Column(name = "pix_tx_id", length = 120)
    private String pixTxId;

    @Column(name = "pix_payer_note", length = 255)
    private String pixPayerNote;

    @Column(name = "pending_renewal", nullable = false)
    private boolean pendingRenewal = false;

    @Column(name = "subscription_expires_at")
    private OffsetDateTime subscriptionExpiresAt;

    @Column(name = "has_pending_update", nullable = false)
    private boolean hasPendingUpdate = false;

    @Column(name = "pending_name", length = 150)
    private String pendingName;

    @Column(name = "pending_category", length = 80)
    private String pendingCategory;

    @Column(name = "pending_subsegment", length = 80)
    private String pendingSubsegment;

    @Column(name = "pending_logo_url", columnDefinition = "TEXT")
    private String pendingLogoUrl;

    @Column(name = "pending_description", columnDefinition = "TEXT")
    private String pendingDescription;

    @Column(name = "pending_phone", length = 30)
    private String pendingPhone;

    @Column(name = "pending_whatsapp", length = 30)
    private String pendingWhatsapp;

    @Column(name = "pending_instagram", length = 120)
    private String pendingInstagram;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubsegment() {
        return subsegment;
    }

    public void setSubsegment(String subsegment) {
        this.subsegment = subsegment;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }

    public String getInstagram() {
        return instagram;
    }

    public void setInstagram(String instagram) {
        this.instagram = instagram;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPixTxId() {
        return pixTxId;
    }

    public void setPixTxId(String pixTxId) {
        this.pixTxId = pixTxId;
    }

    public String getPixPayerNote() {
        return pixPayerNote;
    }

    public void setPixPayerNote(String pixPayerNote) {
        this.pixPayerNote = pixPayerNote;
    }

    public boolean isPendingRenewal() {
        return pendingRenewal;
    }

    public void setPendingRenewal(boolean pendingRenewal) {
        this.pendingRenewal = pendingRenewal;
    }

    public OffsetDateTime getSubscriptionExpiresAt() {
        return subscriptionExpiresAt;
    }

    public void setSubscriptionExpiresAt(OffsetDateTime subscriptionExpiresAt) {
        this.subscriptionExpiresAt = subscriptionExpiresAt;
    }

    public boolean isHasPendingUpdate() {
        return hasPendingUpdate;
    }

    public void setHasPendingUpdate(boolean hasPendingUpdate) {
        this.hasPendingUpdate = hasPendingUpdate;
    }

    public String getPendingName() {
        return pendingName;
    }

    public void setPendingName(String pendingName) {
        this.pendingName = pendingName;
    }

    public String getPendingCategory() {
        return pendingCategory;
    }

    public void setPendingCategory(String pendingCategory) {
        this.pendingCategory = pendingCategory;
    }

    public String getPendingSubsegment() {
        return pendingSubsegment;
    }

    public void setPendingSubsegment(String pendingSubsegment) {
        this.pendingSubsegment = pendingSubsegment;
    }

    public String getPendingLogoUrl() {
        return pendingLogoUrl;
    }

    public void setPendingLogoUrl(String pendingLogoUrl) {
        this.pendingLogoUrl = pendingLogoUrl;
    }

    public String getPendingDescription() {
        return pendingDescription;
    }

    public void setPendingDescription(String pendingDescription) {
        this.pendingDescription = pendingDescription;
    }

    public String getPendingPhone() {
        return pendingPhone;
    }

    public void setPendingPhone(String pendingPhone) {
        this.pendingPhone = pendingPhone;
    }

    public String getPendingWhatsapp() {
        return pendingWhatsapp;
    }

    public void setPendingWhatsapp(String pendingWhatsapp) {
        this.pendingWhatsapp = pendingWhatsapp;
    }

    public String getPendingInstagram() {
        return pendingInstagram;
    }

    public void setPendingInstagram(String pendingInstagram) {
        this.pendingInstagram = pendingInstagram;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
