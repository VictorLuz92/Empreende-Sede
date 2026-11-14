package com.empreendesede.controller;

import com.empreendesede.dto.AuthDtos.AuthResponse;
import com.empreendesede.dto.AuthDtos.LoginRequest;
import com.empreendesede.dto.AuthDtos.OAuthRequest;
import com.empreendesede.dto.AuthDtos.ProvidersResponse;
import com.empreendesede.dto.AuthDtos.RegisterRequest;
import com.empreendesede.dto.AuthDtos.UpdateAvatarRequest;
import com.empreendesede.dto.AuthDtos.UserInfo;
import com.empreendesede.service.AuthService;
import com.empreendesede.service.TokenService;
import com.empreendesede.service.TokenService.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    public AuthController(AuthService authService, TokenService tokenService) {
        this.authService = authService;
        this.tokenService = tokenService;
    }

    @GetMapping("/providers")
    public ProvidersResponse providers() {
        return authService.getProvidersConfig();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerUser(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.loginUser(request);
    }

    @PostMapping("/oauth/google")
    public AuthResponse googleOAuth(@Valid @RequestBody OAuthRequest request) {
        return authService.loginWithGoogle(request.token());
    }

    @PostMapping("/oauth/microsoft")
    public AuthResponse microsoftOAuth(@Valid @RequestBody OAuthRequest request) {
        return authService.loginWithMicrosoft(request.token());
    }

    @GetMapping("/me")
    public UserInfo me(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        AuthenticatedUser user = tokenService.requireUser(authHeader);
        return authService.getUserInfo(user.id());
    }

    @PutMapping("/me/avatar")
    public UserInfo updateAvatar(
            @RequestBody UpdateAvatarRequest request,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        AuthenticatedUser user = tokenService.requireUser(authHeader);
        return authService.updateAvatar(user.id(), request != null ? request.avatarUrl() : null);
    }
}
