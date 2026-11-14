package com.empreendesede.controller;

import com.empreendesede.exception.ApiException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/cep")
public class CepController {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public CepController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .build();
    }

    public record CepLookupResponse(
            boolean found,
            String cep,
            String street,
            String neighborhood,
            String city,
            String state
    ) {}

    @GetMapping("/{cep}")
    @SuppressWarnings("unchecked")
    public CepLookupResponse lookup(@PathVariable("cep") String rawCep) {
        String digits = rawCep != null ? rawCep.replaceAll("\\D", "") : "";
        if (digits.length() != 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Informe um CEP válido com 8 dígitos.");
        }

        String formattedCep = digits.substring(0, 5) + "-" + digits.substring(5);
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create("https://viacep.com.br/ws/" + digits + "/json/"))
                    .GET()
                    .timeout(Duration.ofSeconds(6))
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                return new CepLookupResponse(false, formattedCep, "", "", "", "");
            }

            Map<String, Object> body = objectMapper.readValue(resp.body(), Map.class);
            if (Boolean.TRUE.equals(body.get("erro")) || "true".equalsIgnoreCase(String.valueOf(body.get("erro")))) {
                return new CepLookupResponse(false, formattedCep, "", "", "", "");
            }

            String street = stringVal(body.get("logradouro"));
            String neighborhood = stringVal(body.get("bairro"));
            String city = stringVal(body.get("localidade"));
            String state = stringVal(body.get("uf"));

            boolean found = !city.isEmpty() && !state.isEmpty();
            return new CepLookupResponse(found, formattedCep, street, neighborhood, city, state);
        } catch (Exception ex) {
            return new CepLookupResponse(false, formattedCep, "", "", "", "");
        }
    }

    private String stringVal(Object value) {
        return value != null ? value.toString().trim() : "";
    }
}
