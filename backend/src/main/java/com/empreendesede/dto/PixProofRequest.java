package com.empreendesede.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PixProofRequest(
        @Size(max = 120, message = "O código da transação deve ter no máximo 120 caracteres.")
        String txId,

        @NotBlank(message = "Informe o nome de quem enviou o Pix.")
        @Size(max = 255, message = "O nome de quem enviou o Pix deve ter no máximo 255 caracteres.")
        String payerNote,

        boolean renewal
) {}
