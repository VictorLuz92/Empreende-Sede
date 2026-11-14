package com.empreendesede.controller;

import com.empreendesede.dto.AuthDtos.AuthResponse;
import com.empreendesede.dto.AuthDtos.LoginRequest;
import com.empreendesede.dto.CompanyRequest;
import com.empreendesede.dto.CompanyResponse;
import com.empreendesede.service.AuthService;
import com.empreendesede.service.CompanyService;
import com.empreendesede.service.TokenService;
import com.empreendesede.service.TokenService.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AuthService authService;
    private final CompanyService companyService;
    private final TokenService tokenService;

    public AdminController(
            AuthService authService,
            CompanyService companyService,
            TokenService tokenService
    ) {
        this.authService = authService;
        this.companyService = companyService;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.loginAdmin(request);
    }

    @GetMapping("/pending")
    public List<CompanyResponse> listPending(
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        tokenService.requireAdmin(authHeader);
        return companyService.listPendingApprovals();
    }

    @GetMapping("/companies")
    public List<CompanyResponse> listAll(
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        tokenService.requireAdmin(authHeader);
        return companyService.listAllForAdmin();
    }

    @PutMapping("/companies/{id}")
    public CompanyResponse updateByAdmin(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CompanyRequest request,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        AuthenticatedUser admin = tokenService.requireAdmin(authHeader);
        return companyService.update(id, request, admin);
    }

    @PostMapping("/companies/{id}/approve")
    public CompanyResponse approve(
            @PathVariable("id") UUID id,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        tokenService.requireAdmin(authHeader);
        return companyService.approve(id);
    }

    @PostMapping("/companies/{id}/renew")
    public CompanyResponse renewOneMonth(
            @PathVariable("id") UUID id,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        tokenService.requireAdmin(authHeader);
        return companyService.grantOneMonthByAdmin(id);
    }

    @PostMapping("/companies/{id}/reject")
    public ResponseEntity<Void> reject(
            @PathVariable("id") UUID id,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        tokenService.requireAdmin(authHeader);
        companyService.reject(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") UUID id,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        tokenService.requireAdmin(authHeader);
        companyService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
