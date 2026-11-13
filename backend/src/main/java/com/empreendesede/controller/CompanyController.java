package com.empreendesede.controller;

import com.empreendesede.dto.CompanyRequest;
import com.empreendesede.dto.CompanyResponse;
import com.empreendesede.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<CompanyResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category
    ) {
        return companyService.listCompanies(q, category);
    }

    @GetMapping("/{id}")
    public CompanyResponse getById(@PathVariable UUID id) {
        return companyService.getById(id);
    }

    @GetMapping("/categories")
    public List<String> listCategories() {
        return companyService.listCategories();
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CompanyRequest request) {
        CompanyResponse created = companyService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public CompanyResponse update(@PathVariable UUID id, @Valid @RequestBody CompanyRequest request) {
        return companyService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companyService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
