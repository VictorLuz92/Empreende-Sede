package com.empreendesede.service;

import com.empreendesede.dto.CompanyRequest;
import com.empreendesede.dto.CompanyResponse;
import com.empreendesede.dto.PixProofRequest;
import com.empreendesede.exception.ApiException;
import com.empreendesede.exception.ResourceNotFoundException;
import com.empreendesede.model.Company;
import com.empreendesede.repository.CompanyRepository;
import com.empreendesede.service.TokenService.AuthenticatedUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CompanyService {

    public static final List<String> OFFICIAL_CATEGORIES = List.of(
            "Mão de Obra",
            "Comércio",
            "Gastronomia",
            "Beleza (Masculina/Feminina)",
            "Vestuário"
    );

    public static final Map<String, List<String>> SUBSEGMENTS_BY_CATEGORY;
    static {
        Map<String, List<String>> map = new LinkedHashMap<>();
        map.put("Mão de Obra", List.of("Hidráulica", "Elétrica", "Marcenaria", "Reformas"));
        map.put("Comércio", List.of("Hortifrúti", "Eletrônicos", "Mercearia", "Papelaria"));
        map.put("Gastronomia", List.of("Padaria", "Pizzaria", "Lanchonete", "Doceria", "Restaurante"));
        map.put("Beleza (Masculina/Feminina)", List.of("Salão", "Barbearia", "Manicure", "Estética"));
        map.put("Vestuário", List.of("Moda", "Fitness", "Casual", "Acessórios"));
        SUBSEGMENTS_BY_CATEGORY = Collections.unmodifiableMap(map);
    }

    private final CompanyRepository companyRepository;
    private final PixPayloadGenerator pixPayloadGenerator;
    private final int pixDurationDays;

    public CompanyService(
            CompanyRepository companyRepository,
            PixPayloadGenerator pixPayloadGenerator,
            @Value("${app.pix.duration-days:30}") int pixDurationDays
    ) {
        this.companyRepository = companyRepository;
        this.pixPayloadGenerator = pixPayloadGenerator;
        this.pixDurationDays = pixDurationDays;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> listCompanies(String query, String category, String subsegment) {
        String normalizedQuery = query != null ? query.trim() : null;
        String normalizedCategory = category != null ? category.trim() : null;
        String normalizedSubsegment = subsegment != null ? subsegment.trim() : null;
        OffsetDateTime now = OffsetDateTime.now();

        boolean noFilters = (normalizedQuery == null || normalizedQuery.isEmpty())
                && (normalizedCategory == null || normalizedCategory.isEmpty())
                && (normalizedSubsegment == null || normalizedSubsegment.isEmpty());

        List<Company> companies = noFilters
                ? companyRepository.findPublishedCompanies(now)
                : companyRepository.searchPublishedCompanies(normalizedQuery, normalizedCategory, normalizedSubsegment, now);

        return companies.stream()
                .map(CompanyResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> listMine(AuthenticatedUser user) {
        return companyRepository.findByOwnerIdAndActiveTrueOrderByUpdatedAtDesc(user.id()).stream()
                .map(c -> CompanyResponse.fromEntity(c, pixPayloadGenerator.generateForCompany(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> listPendingApprovals() {
        return companyRepository.findPendingApprovals().stream()
                .map(c -> CompanyResponse.fromEntity(c, pixPayloadGenerator.generateForCompany(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> listAllForAdmin() {
        return companyRepository.findByActiveTrueOrderByUpdatedAtDesc().stream()
                .map(CompanyResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse getById(UUID id) {
        Company company = findActiveOrThrow(id);
        OffsetDateTime now = OffsetDateTime.now();
        if (!company.isApproved() || (company.getSubscriptionExpiresAt() != null && !company.getSubscriptionExpiresAt().isAfter(now))) {
            throw new ResourceNotFoundException("Empresa não encontrada.");
        }
        return CompanyResponse.fromEntity(company);
    }

    @Transactional(readOnly = true)
    public List<String> listCategories() {
        return OFFICIAL_CATEGORIES;
    }

    @Transactional(readOnly = true)
    public Map<String, List<String>> listSubsegments() {
        return SUBSEGMENTS_BY_CATEGORY;
    }

    @Transactional
    public CompanyResponse create(CompanyRequest request, AuthenticatedUser user) {
        Company company = new Company();
        applyRequest(company, request);
        company.setActive(true);
        company.setOwnerId(user.id());
        company.setOwnerEmail(user.email());
        company.setHasPendingUpdate(false);

        if (user.isAdmin()) {
            company.setApproved(true);
            company.setPaymentStatus("EXEMPT");
            company.setSubscriptionExpiresAt(null);
        } else {
            company.setApproved(false);
            company.setPaymentStatus("PENDING_PAYMENT");
            company.setPendingRenewal(false);
            company.setSubscriptionExpiresAt(null);
        }

        Company saved = companyRepository.save(company);
        return CompanyResponse.fromEntity(saved, pixPayloadGenerator.generateForCompany(saved.getId()));
    }

    @Transactional
    public CompanyResponse update(UUID id, CompanyRequest request, AuthenticatedUser user) {
        Company company = findActiveOrThrow(id);

        if (user.isAdmin()) {
            applyRequest(company, request);
            clearPendingFields(company);
            company.setApproved(true);
            return CompanyResponse.fromEntity(companyRepository.save(company));
        }

        if (company.getOwnerId() == null || !company.getOwnerId().equals(user.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Você só pode editar a sua própria loja.");
        }

        company.setPendingName(request.name().trim());
        company.setPendingCategory(
                request.category() != null && !request.category().isBlank()
                        ? request.category().trim()
                        : "Geral"
        );
        company.setPendingSubsegment(request.subsegment() != null && !request.subsegment().isBlank() ? request.subsegment().trim() : null);
        company.setPendingLogoUrl(request.logoUrl() != null && !request.logoUrl().isBlank() ? request.logoUrl().trim() : null);
        company.setPendingDescription(request.description().trim());
        company.setPendingPhone(request.phone().trim());
        company.setPendingWhatsapp(sanitizeWhatsapp(request.whatsapp()));
        company.setPendingInstagram(sanitizeInstagram(request.instagram()));
        company.setHasPendingUpdate(true);

        Company saved = companyRepository.save(company);
        return CompanyResponse.fromEntity(saved, pixPayloadGenerator.generateForCompany(saved.getId()));
    }

    @Transactional
    public CompanyResponse submitPixProof(UUID id, PixProofRequest request, AuthenticatedUser user) {
        Company company = findActiveOrThrow(id);
        if (!user.isAdmin() && (company.getOwnerId() == null || !company.getOwnerId().equals(user.id()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Você só pode enviar o comprovante da sua própria loja.");
        }

        company.setPixTxId(request.txId().trim());
        company.setPixPayerNote(request.payerNote() != null ? request.payerNote().trim() : null);
        company.setPaymentStatus("PAYMENT_SUBMITTED");
        if (request.renewal() || company.isApproved()) {
            company.setPendingRenewal(true);
        }

        Company saved = companyRepository.save(company);
        return CompanyResponse.fromEntity(saved, pixPayloadGenerator.generateForCompany(saved.getId()));
    }

    @Transactional
    public CompanyResponse approve(UUID id) {
        Company company = findActiveOrThrow(id);
        OffsetDateTime now = OffsetDateTime.now();

        if (company.isHasPendingUpdate()) {
            company.setName(company.getPendingName());
            company.setCategory(company.getPendingCategory() != null ? company.getPendingCategory() : "Geral");
            company.setSubsegment(company.getPendingSubsegment());
            company.setLogoUrl(company.getPendingLogoUrl());
            company.setDescription(company.getPendingDescription());
            company.setPhone(company.getPendingPhone());
            company.setWhatsapp(company.getPendingWhatsapp());
            company.setInstagram(company.getPendingInstagram());
            clearPendingFields(company);
        }

        boolean needsSubscriptionGrant = !company.isApproved()
                || "PAYMENT_SUBMITTED".equalsIgnoreCase(company.getPaymentStatus())
                || "PENDING_PAYMENT".equalsIgnoreCase(company.getPaymentStatus())
                || company.isPendingRenewal();

        if (needsSubscriptionGrant) {
            OffsetDateTime base = (company.getSubscriptionExpiresAt() != null && company.getSubscriptionExpiresAt().isAfter(now))
                    ? company.getSubscriptionExpiresAt()
                    : now;
            company.setSubscriptionExpiresAt(base.plusDays(pixDurationDays));
            company.setPaymentStatus("PAID");
            company.setPendingRenewal(false);
        }

        company.setApproved(true);
        return CompanyResponse.fromEntity(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse grantOneMonthByAdmin(UUID id) {
        Company company = findActiveOrThrow(id);
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime base = (company.getSubscriptionExpiresAt() != null && company.getSubscriptionExpiresAt().isAfter(now))
                ? company.getSubscriptionExpiresAt()
                : now;
        company.setSubscriptionExpiresAt(base.plusDays(pixDurationDays));
        company.setPaymentStatus("PAID");
        company.setPendingRenewal(false);
        company.setApproved(true);
        return CompanyResponse.fromEntity(companyRepository.save(company));
    }

    @Transactional
    public void reject(UUID id) {
        Company company = findActiveOrThrow(id);
        if (!company.isApproved()) {
            company.setActive(false);
        } else {
            clearPendingFields(company);
            if ("PAYMENT_SUBMITTED".equalsIgnoreCase(company.getPaymentStatus()) || company.isPendingRenewal()) {
                company.setPendingRenewal(false);
                boolean stillActivePlan = company.getSubscriptionExpiresAt() != null
                        && company.getSubscriptionExpiresAt().isAfter(OffsetDateTime.now());
                company.setPaymentStatus(stillActivePlan ? "PAID" : "EXPIRED");
            }
        }
        companyRepository.save(company);
    }

    @Transactional
    public void deactivate(UUID id) {
        Company company = findActiveOrThrow(id);
        company.setActive(false);
        companyRepository.save(company);
    }

    private void clearPendingFields(Company company) {
        company.setHasPendingUpdate(false);
        company.setPendingName(null);
        company.setPendingCategory(null);
        company.setPendingSubsegment(null);
        company.setPendingLogoUrl(null);
        company.setPendingDescription(null);
        company.setPendingPhone(null);
        company.setPendingWhatsapp(null);
        company.setPendingInstagram(null);
    }

    private Company findActiveOrThrow(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada."));
        if (!company.isActive()) {
            throw new ResourceNotFoundException("Empresa não encontrada.");
        }
        return company;
    }

    private void applyRequest(Company company, CompanyRequest request) {
        company.setName(request.name().trim());
        company.setCategory(
                request.category() != null && !request.category().isBlank()
                        ? request.category().trim()
                        : "Geral"
        );
        company.setSubsegment(request.subsegment() != null && !request.subsegment().isBlank() ? request.subsegment().trim() : null);
        company.setLogoUrl(request.logoUrl() != null && !request.logoUrl().isBlank() ? request.logoUrl().trim() : null);
        company.setDescription(request.description().trim());
        company.setPhone(request.phone().trim());
        company.setWhatsapp(sanitizeWhatsapp(request.whatsapp()));
        company.setInstagram(sanitizeInstagram(request.instagram()));
    }

    private String sanitizeWhatsapp(String whatsapp) {
        if (whatsapp == null || whatsapp.isBlank()) {
            return null;
        }
        String digits = whatsapp.replaceAll("\\D", "");
        return digits.isEmpty() ? null : digits;
    }

    private String sanitizeInstagram(String instagram) {
        if (instagram == null || instagram.isBlank()) {
            return null;
        }
        String clean = instagram.trim();
        if (clean.startsWith("@")) {
            clean = clean.substring(1);
        }
        return clean;
    }
}
