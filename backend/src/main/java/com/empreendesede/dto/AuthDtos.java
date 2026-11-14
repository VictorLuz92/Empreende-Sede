package com.empreendesede.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank(message = "O nome é obrigatório.")
            @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
            String name,

            @NotBlank(message = "O e-mail é obrigatório.")
            @Email(message = "Informe um e-mail válido.")
            @Size(max = 180)
            String email,

            @NotBlank(message = "A senha é obrigatória.")
            @Size(min = 6, max = 100, message = "A senha deve ter pelo menos 6 caracteres.")
            String password
    ) {}

    public record LoginRequest(
            @NotBlank(message = "O e-mail é obrigatório.")
            @Email(message = "Informe um e-mail válido.")
            String email,

            @NotBlank(message = "A senha é obrigatória.")
            String password
    ) {}

    public record OAuthRequest(
            @NotBlank(message = "Token de autorização não informado.")
            String token
    ) {}

    public record UpdateAvatarRequest(
            String avatarUrl
    ) {}

    public record UserInfo(
            UUID id,
            String name,
            String email,
            String role,
            String authProvider,
            String avatarUrl
    ) {}

    public record AuthResponse(
            String token,
            UserInfo user
    ) {}

    public record ProvidersResponse(
            boolean googleEnabled,
            String googleClientId,
            boolean microsoftEnabled,
            String microsoftClientId,
            String pixKey,
            String pixMerchantName,
            String pixMerchantCity,
            String pixMonthlyAmount,
            int pixDurationDays
    ) {}
}
