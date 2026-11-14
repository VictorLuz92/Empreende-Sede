package com.empreendesede.service;

import com.empreendesede.dto.CompanyRequest;
import com.empreendesede.dto.CompanyResponse;
import com.empreendesede.dto.PixProofRequest;
import com.empreendesede.exception.ApiException;
import com.empreendesede.exception.ResourceNotFoundException;
import com.empreendesede.model.Company;
import com.empreendesede.repository.CompanyRepository;
import com.empreendesede.repository.UserRepository;
import com.empreendesede.service.TokenService.AuthenticatedUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CompanyService {

    public static final String ADDRESS_CONFIRMED_BY_CEP = "CONFIRMED_BY_CEP";
    public static final String ADDRESS_PENDING_ADMIN = "PENDING_ADMIN_CONFIRMATION";
    public static final String ADDRESS_CONFIRMED_BY_ADMIN = "CONFIRMED_BY_ADMIN";

    public static final List<String> OFFICIAL_CATEGORIES = List.of(
            "Mão de Obra",
            "Comércio",
            "Gastronomia",
            "Beleza",
            "Vestuário"
    );

    public static final Map<String, List<String>> SUBSEGMENTS_BY_CATEGORY;
    static {
        Map<String, List<String>> map = new LinkedHashMap<>();
        map.put("Mão de Obra", List.of("Hidráulica", "Elétrica", "Marcenaria", "Reformas"));
        map.put("Comércio", List.of("Hortifrúti", "Eletrônicos", "Mercearia", "Papelaria"));
        map.put("Gastronomia", List.of("Padaria", "Pizzaria", "Lanchonete", "Doceria", "Restaurante"));
        map.put("Beleza", List.of("Salão", "Barbearia", "Manicure", "Estética"));
        map.put("Vestuário", List.of("Moda", "Fitness", "Casual", "Acessórios"));
        SUBSEGMENTS_BY_CATEGORY = Collections.unmodifiableMap(map);
    }

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PixPayloadGenerator pixPayloadGenerator;
    private final int pixDurationDays;

    public CompanyService(
            CompanyRepository companyRepository,
            UserRepository userRepository,
            PixPayloadGenerator pixPayloadGenerator,
            @Value("${app.pix.duration-days:30}") int pixDurationDays
    ) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
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
    public List<CompanyResponse> listPendingAddressConfirmations() {
        return companyRepository.findPendingAddressConfirmations().stream()
                .map(CompanyResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> listPendingSubsegments() {
        return companyRepository.findPendingSubsegments().stream()
                .map(CompanyResponse::fromEntity)
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
        boolean exempt = "EXEMPT".equalsIgnoreCase(company.getPaymentStatus());
        boolean hasValidSub = company.getSubscriptionExpiresAt() != null
                && company.getSubscriptionExpiresAt().isAfter(now);
        if (!company.isApproved() || (!exempt && !hasValidSub)) {
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
        Map<String, Set<String>> merged = new LinkedHashMap<>();
        SUBSEGMENTS_BY_CATEGORY.forEach((cat, subs) -> merged.put(cat, new LinkedHashSet<>(subs)));

        for (Object[] row : companyRepository.findDistinctActiveCategorySubsegments()) {
            String cat = row[0] != null ? row[0].toString().trim() : "";
            String sub = row[1] != null ? row[1].toString().trim() : "";
            if (!cat.isEmpty() && !sub.isEmpty()) {
                merged.computeIfAbsent(cat, k -> new LinkedHashSet<>()).add(sub);
            }
        }

        Map<String, List<String>> result = new LinkedHashMap<>();
        merged.forEach((cat, set) -> result.put(cat, List.copyOf(set)));
        return result;
    }

    @Transactional
    public CompanyResponse create(CompanyRequest request, AuthenticatedUser user) {
        validateCepIfRequired(request);

        Company company = new Company();
        applyRequest(company, request);
        company.setActive(true);
        company.setOwnerId(user.id());
        company.setOwnerEmail(user.email());
        company.setHasPendingUpdate(false);

        boolean manualAddressPending = Boolean.TRUE.equals(request.addressNotFoundByCep());
        if (user.isAdmin()) {
            company.setApproved(true);
            company.setPaymentStatus("EXEMPT");
            company.setSubscriptionExpiresAt(null);
            company.setAddressStatus(manualAddressPending ? ADDRESS_CONFIRMED_BY_ADMIN : ADDRESS_CONFIRMED_BY_CEP);
            company.setAddressConfirmed(true);
        } else {
            company.setApproved(false);
            company.setPaymentStatus("PENDING_PAYMENT");
            company.setPendingRenewal(false);
            company.setSubscriptionExpiresAt(null);
            company.setAddressStatus(manualAddressPending ? ADDRESS_PENDING_ADMIN : ADDRESS_CONFIRMED_BY_CEP);
            company.setAddressConfirmed(!manualAddressPending);
        }

        Company saved = companyRepository.save(company);
        return CompanyResponse.fromEntity(saved, pixPayloadGenerator.generateForCompany(saved.getId()));
    }

    @Transactional
    public CompanyResponse update(UUID id, CompanyRequest request, AuthenticatedUser user) {
        validateCepIfRequired(request);
        Company company = findActiveOrThrow(id);
        boolean manualAddressPending = Boolean.TRUE.equals(request.addressNotFoundByCep());

        if (user.isAdmin()) {
            applyRequest(company, request);
            clearPendingFields(company);
            company.setApproved(true);
            company.setAddressStatus(manualAddressPending ? ADDRESS_CONFIRMED_BY_ADMIN : ADDRESS_CONFIRMED_BY_CEP);
            company.setAddressConfirmed(true);
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
        company.setPendingSubsegment(trimOrNull(request.subsegment()));
        company.setPendingLogoUrl(trimOrNull(request.logoUrl()));
        company.setPendingDescription(request.description().trim());
        company.setPendingOwnerName(request.ownerName().trim());
        company.setPendingCep(formatCep(request.cep()));
        company.setPendingStreet(request.street().trim());
        company.setPendingAddressNumber(request.addressNumber().trim());
        company.setPendingComplement(trimOrNull(request.complement()));
        company.setPendingNeighborhood(request.neighborhood().trim());
        company.setPendingCity(request.city().trim());
        company.setPendingState(request.state().trim().toUpperCase());
        company.setPendingAddressStatus(manualAddressPending ? ADDRESS_PENDING_ADMIN : ADDRESS_CONFIRMED_BY_CEP);
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

        company.setPixTxId(trimOrNull(request.txId()));
        company.setPixPayerNote(request.payerNote().trim());
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
            company.setOwnerName(company.getPendingOwnerName());
            company.setCep(company.getPendingCep());
            company.setStreet(company.getPendingStreet());
            company.setAddressNumber(company.getPendingAddressNumber());
            company.setComplement(company.getPendingComplement());
            company.setNeighborhood(company.getPendingNeighborhood());
            company.setCity(company.getPendingCity());
            company.setState(company.getPendingState());
            String nextAddrStatus = company.getPendingAddressStatus() != null
                    ? company.getPendingAddressStatus()
                    : ADDRESS_CONFIRMED_BY_CEP;
            company.setAddressStatus(nextAddrStatus);
            company.setAddressConfirmed(!ADDRESS_PENDING_ADMIN.equalsIgnoreCase(nextAddrStatus));
            company.setPhone(company.getPendingPhone());
            company.setWhatsapp(company.getPendingWhatsapp());
            company.setInstagram(company.getPendingInstagram());
            clearPendingFields(company);
        }

        boolean needsSubscriptionGrant = !company.isApproved()
                || "PAYMENT_SUBMITTED".equalsIgnoreCase(company.getPaymentStatus())
                || "PENDING_PAYMENT".equalsIgnoreCase(company.getPaymentStatus())
                || "EXPIRED".equalsIgnoreCase(company.getPaymentStatus())
                || company.isPendingRenewal()
                || (!"EXEMPT".equalsIgnoreCase(company.getPaymentStatus()) && company.getSubscriptionExpiresAt() == null);

        if (needsSubscriptionGrant) {
            OffsetDateTime base = (company.getSubscriptionExpiresAt() != null && company.getSubscriptionExpiresAt().isAfter(now))
                    ? company.getSubscriptionExpiresAt()
                    : now;
            OffsetDateTime nextExpiry = base.plusDays(pixDurationDays);
            company.setSubscriptionExpiresAt(nextExpiry);
            company.setPaymentStatus("PAID");
            company.setPendingRenewal(false);
            extendOwnerSubscription(company.getOwnerId(), nextExpiry);
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
        OffsetDateTime nextExpiry = base.plusDays(pixDurationDays);
        company.setSubscriptionExpiresAt(nextExpiry);
        company.setPaymentStatus("PAID");
        company.setPendingRenewal(false);
        company.setApproved(true);
        extendOwnerSubscription(company.getOwnerId(), nextExpiry);
        return CompanyResponse.fromEntity(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse confirmAddressByAdmin(UUID id) {
        Company company = findActiveOrThrow(id);
        if (company.isHasPendingUpdate() && ADDRESS_PENDING_ADMIN.equalsIgnoreCase(company.getPendingAddressStatus())) {
            company.setPendingAddressStatus(ADDRESS_CONFIRMED_BY_ADMIN);
        }
        company.setAddressStatus(ADDRESS_CONFIRMED_BY_ADMIN);
        company.setAddressConfirmed(true);
        return CompanyResponse.fromEntity(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse assignSubsegmentByAdmin(UUID id, String rawSubsegment) {
        Company company = findActiveOrThrow(id);
        String normalized = trimOrNull(rawSubsegment);
        if (normalized == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Informe ou crie uma subsessão (subclasse).");
        }
        if (normalized.length() > 80) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A subsessão deve ter no máximo 80 caracteres.");
        }

        if (company.isHasPendingUpdate() && trimOrNull(company.getPendingSubsegment()) == null) {
            company.setPendingSubsegment(normalized);
        }
        if (trimOrNull(company.getSubsegment()) == null || !company.isHasPendingUpdate()) {
            company.setSubsegment(normalized);
        }
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

    private void extendOwnerSubscription(UUID ownerId, OffsetDateTime companyExpiry) {
        if (ownerId == null) {
            return;
        }
        userRepository.findById(ownerId).ifPresent(owner -> {
            if (!"ADMIN".equalsIgnoreCase(owner.getRole())) {
                OffsetDateTime current = owner.getSubscriptionExpiresAt();
                OffsetDateTime updated = (current != null && current.isAfter(companyExpiry)) ? current : companyExpiry;
                owner.setSubscriptionExpiresAt(updated);
                userRepository.save(owner);
            }
        });
    }

    private void validateCepIfRequired(CompanyRequest request) {
        if (Boolean.TRUE.equals(request.addressNotFoundByCep())) {
            return;
        }
        String digits = request.cep() != null ? request.cep().replaceAll("\\D", "") : "";
        if (digits.length() != 8) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um CEP válido com 8 dígitos ou marque que não encontrou o endereço pelo CEP."
            );
        }
    }

    private void clearPendingFields(Company company) {
        company.setHasPendingUpdate(false);
        company.setPendingName(null);
        company.setPendingCategory(null);
        company.setPendingSubsegment(null);
        company.setPendingLogoUrl(null);
        company.setPendingDescription(null);
        company.setPendingOwnerName(null);
        company.setPendingCep(null);
        company.setPendingStreet(null);
        company.setPendingAddressNumber(null);
        company.setPendingComplement(null);
        company.setPendingNeighborhood(null);
        company.setPendingCity(null);
        company.setPendingState(null);
        company.setPendingAddressStatus(null);
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
        company.setSubsegment(trimOrNull(request.subsegment()));
        company.setLogoUrl(trimOrNull(request.logoUrl()));
        company.setDescription(request.description().trim());
        company.setOwnerName(request.ownerName().trim());
        company.setCep(formatCep(request.cep()));
        company.setStreet(request.street().trim());
        company.setAddressNumber(request.addressNumber().trim());
        company.setComplement(trimOrNull(request.complement()));
        company.setNeighborhood(request.neighborhood().trim());
        company.setCity(request.city().trim());
        company.setState(request.state().trim().toUpperCase());
        company.setPhone(request.phone().trim());
        company.setWhatsapp(sanitizeWhatsapp(request.whatsapp()));
        company.setInstagram(sanitizeInstagram(request.instagram()));
    }

    private String formatCep(String cep) {
        if (cep == null || cep.isBlank()) {
            return null;
        }
        String digits = cep.replaceAll("\\D", "");
        if (digits.length() == 8) {
            return digits.substring(0, 5) + "-" + digits.substring(5);
        }
        return cep.trim();
    }

    private String trimOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
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
