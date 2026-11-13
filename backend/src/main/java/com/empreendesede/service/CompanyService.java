package com.empreendesede.service;

import com.empreendesede.dto.CompanyRequest;
import com.empreendesede.dto.CompanyResponse;
import com.empreendesede.exception.ResourceNotFoundException;
import com.empreendesede.model.Company;
import com.empreendesede.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> listCompanies(String query, String category) {
        String normalizedQuery = query != null ? query.trim() : null;
        String normalizedCategory = category != null ? category.trim() : null;

        List<Company> companies = (normalizedQuery == null || normalizedQuery.isEmpty())
                && (normalizedCategory == null || normalizedCategory.isEmpty())
                ? companyRepository.findByActiveTrueOrderByNameAsc()
                : companyRepository.searchActiveCompanies(normalizedQuery, normalizedCategory);

        return companies.stream()
                .map(CompanyResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse getById(UUID id) {
        Company company = findActiveOrThrow(id);
        return CompanyResponse.fromEntity(company);
    }

    @Transactional(readOnly = true)
    public List<String> listCategories() {
        return companyRepository.findDistinctCategories();
    }

    @Transactional
    public CompanyResponse create(CompanyRequest request) {
        Company company = new Company();
        applyRequest(company, request);
        company.setActive(true);
        return CompanyResponse.fromEntity(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse update(UUID id, CompanyRequest request) {
        Company company = findActiveOrThrow(id);
        applyRequest(company, request);
        return CompanyResponse.fromEntity(companyRepository.save(company));
    }

    @Transactional
    public void deactivate(UUID id) {
        Company company = findActiveOrThrow(id);
        company.setActive(false);
        companyRepository.save(company);
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
        company.setLogoUrl(request.logoUrl() != null ? request.logoUrl().trim() : null);
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
