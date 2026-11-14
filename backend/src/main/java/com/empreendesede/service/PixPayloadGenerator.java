package com.empreendesede.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.UUID;

/**
 * Gera payload Pix Copia e Cola no padrão EMV QRCPS-MPM (BR Code) com CRC16-CCITT.
 */
@Component
public class PixPayloadGenerator {

    private final String pixKey;
    private final String merchantName;
    private final String merchantCity;
    private final String amount;

    public PixPayloadGenerator(
            @Value("${app.pix.key}") String pixKey,
            @Value("${app.pix.merchant-name}") String merchantName,
            @Value("${app.pix.merchant-city}") String merchantCity,
            @Value("${app.pix.monthly-amount:50.00}") String amount
    ) {
        this.pixKey = pixKey != null ? pixKey.trim() : "";
        this.merchantName = sanitizeAscii(merchantName, 25, "EMPREENDE SEDE");
        this.merchantCity = sanitizeAscii(merchantCity, 15, "SAO PAULO");
        this.amount = amount != null ? amount.trim() : "50.00";
    }

    public String generateForCompany(UUID companyId) {
        if (pixKey.isEmpty()) {
            return "";
        }
        String txRef = "SEDE" + companyId.toString().replace("-", "").substring(0, 16).toUpperCase();

        String gui = tlv("00", "br.gov.bcb.pix");
        String keyField = tlv("01", pixKey);
        String merchantAccountInfo = tlv("26", gui + keyField);

        String additionalData = tlv("62", tlv("05", txRef));

        String payloadWithoutCrc =
                tlv("00", "01")
                + merchantAccountInfo
                + tlv("52", "0000")
                + tlv("53", "986")
                + tlv("54", amount)
                + tlv("58", "BR")
                + tlv("59", merchantName)
                + tlv("60", merchantCity)
                + additionalData
                + "6304";

        String crc = crc16Ccitt(payloadWithoutCrc);
        return payloadWithoutCrc + crc;
    }

    private static String tlv(String id, String value) {
        int len = value.length();
        return id + String.format("%02d", len) + value;
    }

    private static String sanitizeAscii(String text, int maxLen, String fallback) {
        if (text == null || text.isBlank()) {
            return fallback;
        }
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("[^A-Za-z0-9 ]", "")
                .trim()
                .toUpperCase();
        if (normalized.isEmpty()) {
            return fallback;
        }
        return normalized.length() > maxLen ? normalized.substring(0, maxLen) : normalized;
    }

    private static String crc16Ccitt(String input) {
        int crc = 0xFFFF;
        byte[] bytes = input.getBytes(StandardCharsets.UTF_8);
        for (byte b : bytes) {
            crc ^= (b & 0xFF) << 8;
            for (int i = 0; i < 8; i++) {
                if ((crc & 0x8000) != 0) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc <<= 1;
                }
                crc &= 0xFFFF;
            }
        }
        return String.format("%04X", crc);
    }
}
