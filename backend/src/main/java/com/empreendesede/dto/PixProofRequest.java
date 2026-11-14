package com.empreendesede.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PixProofRequest(
        @NotBlank(message = "Informe o código da transação ou comprovante Pix.")
        @Size(max = 120, message = "O código da transação deve ter no máximo 120 caracteres.")
        String txId,

        @Size(max = 255, message = "A observação deve ter no máximo 255 caracteres.")
        String payerNote,

        boolean renewal
) {}
