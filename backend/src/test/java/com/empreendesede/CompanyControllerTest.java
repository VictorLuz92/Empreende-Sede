package com.empreendesede;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CompanyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldListSeededCompaniesAndCleanBeautyCategory() throws Exception {
        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))));

        mockMvc.perform(get("/api/companies/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasItem("Beleza")))
                .andExpect(jsonPath("$", not(hasItem("Beleza (Masculina/Feminina)"))));
    }

    @Test
    void shouldSearchCompanyByName() throws Exception {
        mockMvc.perform(get("/api/companies").param("q", "Café"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Café & Prosa Artesanal")));
    }

    @Test
    void shouldCreateExpiredUserAndPublishAfterAdminPixAndAddressConfirmation() throws Exception {
        String registerPayload = """
                {
                  "name": "Maria Proprietária",
                  "email": "maria.teste@empreendesede.com.br",
                  "password": "SenhaSegura123"
                }
                """;

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.expired", is(true)))
                .andReturn();

        JsonNode regJson = objectMapper.readTree(regResult.getResponse().getContentAsString());
        String userToken = regJson.get("token").asText();

        String companyPayload = """
                {
                  "name": "Padaria Central da Maria",
                  "category": "Gastronomia",
                  "subsegment": "Padaria",
                  "logoUrl": "",
                  "description": "Pães quentinhos todos os dias no centro da cidade.",
                  "ownerName": "Maria Proprietária",
                  "cep": "",
                  "street": "Rua da Comunidade",
                  "addressNumber": "42",
                  "complement": "Loja A",
                  "neighborhood": "Centro",
                  "city": "São Paulo",
                  "state": "SP",
                  "addressNotFoundByCep": true,
                  "phone": "(11) 95555-4444",
                  "whatsapp": "(11) 95555-4444",
                  "instagram": "@padariacentralmaria"
                }
                """;

        MvcResult createResult = mockMvc.perform(post("/api/companies")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(companyPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Padaria Central da Maria")))
                .andExpect(jsonPath("$.ownerName", is("Maria Proprietária")))
                .andExpect(jsonPath("$.expired", is(true)))
                .andExpect(jsonPath("$.approved", is(false)))
                .andExpect(jsonPath("$.addressStatus", is("PENDING_ADMIN_CONFIRMATION")))
                .andExpect(jsonPath("$.addressConfirmed", is(false)))
                .andReturn();

        String companyId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Store must NOT appear on public list before admin confirms Pix and adds 30 days
        mockMvc.perform(get("/api/companies").param("q", "Padaria Central da Maria"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Admin login via /api/admin/login
        String adminLoginPayload = """
                {
                  "email": "admin@empreendesede.com.br",
                  "password": "Admin@123456"
                }
                """;
        MvcResult adminPortalLogin = mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(adminLoginPayload))
                .andExpect(status().isOk())
                .andReturn();
        String adminToken = objectMapper.readTree(adminPortalLogin.getResponse().getContentAsString()).get("token").asText();

        // Address request appears in admin's separate address tab endpoint
        mockMvc.perform(get("/api/admin/address-requests")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(companyId)));

        // Admin confirms address
        mockMvc.perform(post("/api/admin/companies/" + companyId + "/confirm-address")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.addressStatus", is("CONFIRMED_BY_ADMIN")))
                .andExpect(jsonPath("$.addressConfirmed", is(true)));

        // Admin approves Pix and grants 30 days
        mockMvc.perform(post("/api/admin/companies/" + companyId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approved", is(true)))
                .andExpect(jsonPath("$.expired", is(false)))
                .andExpect(jsonPath("$.daysRemaining", is(30)));

        // User account is now active (no longer expired)
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expired", is(false)));

        // Store now appears in public list
        mockMvc.perform(get("/api/companies").param("q", "Padaria Central da Maria"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].ownerName", is("Maria Proprietária")));
    }
}
