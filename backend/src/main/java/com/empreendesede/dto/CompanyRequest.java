package com.empreendesede.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @NotBlank(message = "O nome da empresa é obrigatório.")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
        String name,

        @Size(max = 80, message = "A categoria deve ter no máximo 80 caracteres.")
        String category,

        String logoUrl,

        @NotBlank(message = "A descrição da empresa é obrigatória.")
        String description,

        @NotBlank(message = "O telefone é obrigatório.")
        @Size(max = 30, message = "O telefone deve ter no máximo 30 caracteres.")
        String phone,

        @Size(max = 30, message = "O WhatsApp deve ter no máximo 30 caracteres.")
        String whatsapp,

        @Size(max = 120, message = "O Instagram deve ter no máximo 120 caracteres.")
        String instagram
) {
}
