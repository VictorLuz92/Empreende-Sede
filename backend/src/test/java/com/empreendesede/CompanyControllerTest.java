package com.empreendesede;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CompanyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListSeededCompanies() throws Exception {
        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))));
    }

    @Test
    void shouldSearchCompanyByName() throws Exception {
        mockMvc.perform(get("/api/companies").param("q", "Café"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Café & Prosa Artesanal")));
    }

    @Test
    void shouldCreateCompany() throws Exception {
        String payload = """
                {
                  "name": "Padaria Central",
                  "category": "Gastronomia",
                  "logoUrl": "",
                  "description": "Pães quentinhos todos os dias no centro da cidade.",
                  "phone": "(11) 95555-4444",
                  "whatsapp": "(11) 95555-4444",
                  "instagram": "@padariacentral"
                }
                """;

        mockMvc.perform(post("/api/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Padaria Central")))
                .andExpect(jsonPath("$.whatsapp", is("11955554444")))
                .andExpect(jsonPath("$.instagram", is("padariacentral")));
    }
}
