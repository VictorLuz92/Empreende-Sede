package com.empreendesede.service;

import com.empreendesede.exception.ApiException;
import com.empreendesede.model.UserAccount;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class TokenService {

    private static final long TOKEN_TTL_SECONDS = 7L * 24 * 60 * 60;

    private final byte[] secretBytes;
    private final ObjectMapper objectMapper;

    public TokenService(
            @Value("${app.auth.jwt-secret}") String secret,
            ObjectMapper objectMapper
    ) {
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.objectMapper = objectMapper;
    }

    public record AuthenticatedUser(
            UUID id,
            String email,
            String name,
            String role
    ) {
        public boolean isAdmin() {
            return "ADMIN".equalsIgnoreCase(role);
        }
    }

    public String createToken(UserAccount user) {
        try {
            Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sub", user.getId().toString());
            payload.put("email", user.getEmail());
            payload.put("name", user.getName());
            payload.put("role", user.getRole());
            payload.put("exp", Instant.now().getEpochSecond() + TOKEN_TTL_SECONDS);

            String headerB64 = base64UrlEncode(objectMapper.writeValueAsBytes(header));
            String payloadB64 = base64UrlEncode(objectMapper.writeValueAsBytes(payload));
            String signingInput = headerB64 + "." + payloadB64;
            String signatureB64 = base64UrlEncode(hmacSha256(signingInput));
            return signingInput + "." + signatureB64;
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao gerar token de sessão", e);
        }
    }

    public AuthenticatedUser requireUser(String authHeader) {
        AuthenticatedUser user = optionalUser(authHeader);
        if (user == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Faça login para continuar.");
        }
        return user;
    }

    public AuthenticatedUser requireAdmin(String authHeader) {
        AuthenticatedUser user = requireUser(authHeader);
        if (!user.isAdmin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso restrito ao Administrador do projeto.");
        }
        return user;
    }

    @SuppressWarnings("unchecked")
    public AuthenticatedUser optionalUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            return null;
        }
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Sessão inválida.");
            }
            String signingInput = parts[0] + "." + parts[1];
            byte[] expectedSig = hmacSha256(signingInput);
            byte[] actualSig = Base64.getUrlDecoder().decode(parts[2]);
            if (!MessageDigest.isEqual(expectedSig, actualSig)) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Sessão inválida ou adulterada.");
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(payloadBytes, Map.class);
            long exp = ((Number) claims.get("exp")).longValue();
            if (Instant.now().getEpochSecond() > exp) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Sua sessão expirou. Faça login novamente.");
            }

            return new AuthenticatedUser(
                    UUID.fromString((String) claims.get("sub")),
                    (String) claims.get("email"),
                    (String) claims.get("name"),
                    (String) claims.get("role")
            );
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Sessão inválida.");
        }
    }

    private byte[] hmacSha256(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretBytes, "HmacSHA256"));
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
