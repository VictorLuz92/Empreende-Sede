package com.empreendesede.controller;

import com.empreendesede.dto.CompanyRequest;
import com.empreendesede.dto.CompanyResponse;
import com.empreendesede.dto.PixProofRequest;
import com.empreendesede.service.CompanyService;
import com.empreendesede.service.TokenService;
import com.empreendesede.service.TokenService.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;
    private final TokenService tokenService;

    public CompanyController(CompanyService companyService, TokenService tokenService) {
        this.companyService = companyService;
        this.tokenService = tokenService;
    }

    @GetMapping
    public List<CompanyResponse> list(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "subsegment", required = false) String subsegment
    ) {
        return companyService.listCompanies(q, category, subsegment);
    }

    @GetMapping("/categories")
    public List<String> listCategories() {
        return companyService.listCategories();
    }

    @GetMapping("/subsegments")
    public Map<String, List<String>> listSubsegments() {
        return companyService.listSubsegments();
    }

    @GetMapping("/mine")
    public List<CompanyResponse> listMine(
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        AuthenticatedUser user = tokenService.requireUser(authHeader);
        return companyService.listMine(user);
    }

    @GetMapping("/{id}")
    public CompanyResponse getById(@PathVariable("id") UUID id) {
        return companyService.getById(id);
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(
            @Valid @RequestBody CompanyRequest request,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        AuthenticatedUser user = tokenService.requireUser(authHeader);
        CompanyResponse created = companyService.create(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public CompanyResponse update(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CompanyRequest request,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        AuthenticatedUser user = tokenService.requireUser(authHeader);
        return companyService.update(id, request, user);
    }

    @PostMapping("/{id}/pix-proof")
    public CompanyResponse submitPixProof(
            @PathVariable("id") UUID id,
            @Valid @RequestBody PixProofRequest request,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        AuthenticatedUser user = tokenService.requireUser(authHeader);
        return companyService.submitPixProof(id, request, user);
    }
}
