package com.empreendesede.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @NotBlank(message = "O nome da empresa é obrigatório.")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
        String name,

        @Size(max = 80, message = "A categoria deve ter no máximo 80 caracteres.")
        String category,

        @Size(max = 80, message = "O subsegmento deve ter no máximo 80 caracteres.")
        String subsegment,

        String logoUrl,

        @NotBlank(message = "A descrição da empresa é obrigatória.")
        String description,

        @NotBlank(message = "O nome do proprietário é obrigatório.")
        @Size(max = 120, message = "O nome do proprietário deve ter no máximo 120 caracteres.")
        String ownerName,

        @Size(max = 12, message = "O CEP deve ter no máximo 12 caracteres.")
        String cep,

        @NotBlank(message = "O logradouro/rua é obrigatório.")
        @Size(max = 180, message = "O logradouro deve ter no máximo 180 caracteres.")
        String street,

        @NotBlank(message = "O número do endereço é obrigatório.")
        @Size(max = 30, message = "O número deve ter no máximo 30 caracteres.")
        String addressNumber,

        @Size(max = 120, message = "O complemento deve ter no máximo 120 caracteres.")
        String complement,

        @NotBlank(message = "O bairro é obrigatório.")
        @Size(max = 120, message = "O bairro deve ter no máximo 120 caracteres.")
        String neighborhood,

        @NotBlank(message = "A cidade é obrigatória.")
        @Size(max = 120, message = "A cidade deve ter no máximo 120 caracteres.")
        String city,

        @NotBlank(message = "O estado (UF) é obrigatório.")
        @Size(max = 10, message = "O estado (UF) deve ter no máximo 10 caracteres.")
        String state,

        Boolean addressNotFoundByCep,

        @NotBlank(message = "O telefone é obrigatório.")
        @Size(max = 30, message = "O telefone deve ter no máximo 30 caracteres.")
        String phone,

        @Size(max = 30, message = "O WhatsApp deve ter no máximo 30 caracteres.")
        String whatsapp,

        @Size(max = 120, message = "O Instagram deve ter no máximo 120 caracteres.")
        String instagram
) {
}
