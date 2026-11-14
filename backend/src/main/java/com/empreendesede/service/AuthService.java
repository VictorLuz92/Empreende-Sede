package com.empreendesede.service;

import com.empreendesede.dto.AuthDtos.AuthResponse;
import com.empreendesede.dto.AuthDtos.LoginRequest;
import com.empreendesede.dto.AuthDtos.ProvidersResponse;
import com.empreendesede.dto.AuthDtos.RegisterRequest;
import com.empreendesede.dto.AuthDtos.UserInfo;
import com.empreendesede.exception.ApiException;
import com.empreendesede.model.UserAccount;
import com.empreendesede.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private static final int MAX_AVATAR_DATA_URL_CHARS = 220_000;

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final TokenService tokenService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    private final String adminEmail;
    private final String adminPassword;
    private final String googleClientId;
    private final String microsoftClientId;
    private final String pixKey;
    private final String pixMerchantName;
    private final String pixMerchantCity;
    private final String pixMonthlyAmount;
    private final int pixDurationDays;

    public AuthService(
            UserRepository userRepository,
            PasswordHasher passwordHasher,
            TokenService tokenService,
            ObjectMapper objectMapper,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword,
            @Value("${app.oauth.google-client-id:}") String googleClientId,
            @Value("${app.oauth.microsoft-client-id:}") String microsoftClientId,
            @Value("${app.pix.key}") String pixKey,
            @Value("${app.pix.merchant-name}") String pixMerchantName,
            @Value("${app.pix.merchant-city}") String pixMerchantCity,
            @Value("${app.pix.monthly-amount:50.00}") String pixMonthlyAmount,
            @Value("${app.pix.duration-days:30}") int pixDurationDays
    ) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
        this.adminEmail = adminEmail != null ? adminEmail.trim().toLowerCase() : "";
        this.adminPassword = adminPassword != null ? adminPassword : "";
        this.googleClientId = googleClientId != null ? googleClientId.trim() : "";
        this.microsoftClientId = microsoftClientId != null ? microsoftClientId.trim() : "";
        this.pixKey = pixKey != null ? pixKey.trim() : "";
        this.pixMerchantName = pixMerchantName != null ? pixMerchantName.trim() : "EMPREENDE SEDE";
        this.pixMerchantCity = pixMerchantCity != null ? pixMerchantCity.trim() : "SAO PAULO";
        this.pixMonthlyAmount = pixMonthlyAmount != null ? pixMonthlyAmount.trim() : "50.00";
        this.pixDurationDays = pixDurationDays;
    }

    public ProvidersResponse getProvidersConfig() {
        return new ProvidersResponse(
                !googleClientId.isEmpty(),
                googleClientId,
                !microsoftClientId.isEmpty(),
                microsoftClientId,
                pixKey,
                pixMerchantName,
                pixMerchantCity,
                pixMonthlyAmount,
                pixDurationDays
        );
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (email.equals(adminEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Este e-mail é reservado ao Administrador do projeto.");
        }
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Já existe uma conta cadastrada com este e-mail.");
        }

        UserAccount user = new UserAccount();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordHasher.hash(request.password()));
        user.setAuthProvider("LOCAL");
        user.setRole("USER");

        UserAccount saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse loginUser(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        if (email.equals(adminEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Conta de Administrador deve entrar pelo portal administrativo.");
        }

        UserAccount user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos."));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Conta de Administrador deve entrar pelo portal administrativo.");
        }

        if (user.getPasswordHash() == null || !passwordHasher.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos.");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginAdmin(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        if (!email.equals(adminEmail) || !request.password().equals(adminPassword)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Credenciais de Administrador inválidas.");
        }

        UserAccount admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseGet(() -> {
                    UserAccount created = new UserAccount();
                    created.setEmail(adminEmail);
                    created.setName("Administrador Único");
                    created.setAuthProvider("LOCAL");
                    created.setRole("ADMIN");
                    return created;
                });

        admin.setRole("ADMIN");
        admin.setPasswordHash(passwordHasher.hash(adminPassword));
        UserAccount saved = userRepository.save(admin);
        return buildAuthResponse(saved);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public AuthResponse loginWithGoogle(String idToken) {
        if (googleClientId.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Login com Google (Gmail) ainda não foi configurado com GOOGLE_CLIENT_ID no servidor.");
        }

        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + URLEncoder.encode(idToken, StandardCharsets.UTF_8);
            HttpRequest req = HttpRequest.newBuilder(URI.create(url)).GET().timeout(Duration.ofSeconds(8)).build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() != 200) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Token do Google inválido ou expirado.");
            }

            Map<String, Object> data = objectMapper.readValue(resp.body(), Map.class);
            String aud = String.valueOf(data.getOrDefault("aud", ""));
            String emailVerified = String.valueOf(data.getOrDefault("email_verified", "false"));
            String email = String.valueOf(data.getOrDefault("email", "")).trim().toLowerCase();
            String name = String.valueOf(data.getOrDefault("name", email)).trim();

            if (!googleClientId.equals(aud) || !"true".equalsIgnoreCase(emailVerified) || email.isEmpty()) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Autorização Google inválida para este aplicativo.");
            }

            return upsertOAuthUser(email, name, "GOOGLE");
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Não foi possível validar o login com Google.");
        }
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public AuthResponse loginWithMicrosoft(String accessToken) {
        if (microsoftClientId.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Login com Microsoft (Outlook) ainda não foi configurado com MICROSOFT_CLIENT_ID no servidor.");
        }

        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create("https://graph.microsoft.com/v1.0/me"))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .timeout(Duration.ofSeconds(8))
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() != 200) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Token da Microsoft inválido ou expirado.");
            }

            Map<String, Object> data = objectMapper.readValue(resp.body(), Map.class);
            Object mailObj = data.get("mail") != null ? data.get("mail") : data.get("userPrincipalName");
            String email = mailObj != null ? mailObj.toString().trim().toLowerCase() : "";
            String name = data.get("displayName") != null ? data.get("displayName").toString().trim() : email;

            if (email.isEmpty()) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Conta Microsoft sem e-mail válido.");
            }

            return upsertOAuthUser(email, name, "MICROSOFT");
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Não foi possível validar o login com Microsoft/Outlook.");
        }
    }

    private AuthResponse upsertOAuthUser(String email, String name, String provider) {
        if (email.equals(adminEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Conta de Administrador deve entrar pelo portal administrativo.");
        }

        UserAccount user = userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            UserAccount created = new UserAccount();
            created.setEmail(email);
            created.setName(name.isEmpty() ? email : name);
            created.setAuthProvider(provider);
            created.setRole("USER");
            return created;
        });

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Conta de Administrador deve entrar pelo portal administrativo.");
        }

        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(name);
        }
        UserAccount saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserInfo getUserInfo(UUID userId) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Sessão inválida."));
        return toUserInfo(user);
    }

    @Transactional
    public UserInfo updateAvatar(UUID userId, String rawAvatarUrl) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Sessão inválida."));

        String normalized = rawAvatarUrl != null ? rawAvatarUrl.trim() : "";
        if (normalized.isEmpty()) {
            user.setAvatarUrl(null);
        } else {
            boolean isAllowedDataUrl = normalized.startsWith("data:image/jpeg;base64,")
                    || normalized.startsWith("data:image/png;base64,")
                    || normalized.startsWith("data:image/webp;base64,");
            boolean isHttpUrl = normalized.startsWith("https://") || normalized.startsWith("http://");

            if (!isAllowedDataUrl && !isHttpUrl) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Formato de foto de perfil inválido. Use JPG, PNG ou WebP.");
            }
            if (isAllowedDataUrl && normalized.length() > MAX_AVATAR_DATA_URL_CHARS) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "A foto de perfil deve ter no máximo 150 KB.");
            }
            user.setAvatarUrl(normalized);
        }

        UserAccount saved = userRepository.save(user);
        return toUserInfo(saved);
    }

    private UserInfo toUserInfo(UserAccount user) {
        return new UserInfo(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAuthProvider(),
                user.getAvatarUrl()
        );
    }

    private AuthResponse buildAuthResponse(UserAccount user) {
        String token = tokenService.createToken(user);
        return new AuthResponse(token, toUserInfo(user));
    }
}
